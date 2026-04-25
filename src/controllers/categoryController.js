import { prisma } from "../config/prisma.js";

function slugify(value) {
  const slug = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "category";
}

function normalizeName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function parseSortOrder(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

async function getUniqueCategorySlug(name, categoryIdToIgnore) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.productCategory.findUnique({
      where: { slug },
    });

    if (!existing || existing.id === categoryIdToIgnore) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

async function buildCategoryResponses(categories) {
  const productCounts = await prisma.product.groupBy({
    by: ["categoryId"],
    where: {
      categoryId: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
  });

  const productCountMap = new Map(
    productCounts.map((item) => [item.categoryId, item._count._all]),
  );

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
    productCount: productCountMap.get(category.id) ?? 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }));
}

export async function getCategories(_req, res) {
  try {
    const categories = await prisma.productCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return res.json(await buildCategoryResponses(categories));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load categories",
      error: error.message,
    });
  }
}

export async function createCategory(req, res) {
  try {
    const name = normalizeName(req.body?.name);

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const slug = await getUniqueCategorySlug(name);
    const category = await prisma.productCategory.create({
      data: {
        name,
        slug,
        sortOrder: parseSortOrder(req.body?.sortOrder),
      },
    });
    const [response] = await buildCategoryResponses([category]);

    return res.status(201).json(response);
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "A category with that name already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
}

export async function updateCategory(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const existingCategory = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const name = normalizeName(req.body?.name);

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const slug = await getUniqueCategorySlug(name, id);
    const updatedCategory = await prisma.$transaction(async (tx) => {
      const category = await tx.productCategory.update({
        where: { id },
        data: {
          name,
          slug,
          sortOrder: parseSortOrder(req.body?.sortOrder),
        },
      });

      if (existingCategory.name !== name) {
        await tx.product.updateMany({
          where: {
            categoryLegacy: existingCategory.name,
          },
          data: {
            categoryLegacy: name,
          },
        });
      }

      return category;
    });
    const [response] = await buildCategoryResponses([updatedCategory]);

    return res.json(response);
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "A category with that name already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
}

export async function deleteCategory(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const existingCategory = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const productCount = await prisma.product.count({
      where: {
        OR: [
          { categoryId: existingCategory.id },
          { categoryLegacy: existingCategory.name },
        ],
      },
    });

    if (productCount > 0) {
      return res.status(409).json({
        message:
          "Move products out of this category before deleting it.",
      });
    }

    await prisma.productCategory.delete({ where: { id } });

    return res.json({ message: "Category deleted" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete category",
      error: error.message,
    });
  }
}
