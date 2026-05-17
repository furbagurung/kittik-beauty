import { prisma } from "../config/prisma.js";
import {
  normalizeCatalogStatus,
  normalizeName,
  parseSortOrder,
  slugify,
} from "../utils/slugify.js";

function parseId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function getUniqueSubCategorySlug(name, subCategoryIdToIgnore) {
  const baseSlug = slugify(name, "sub-category");
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.subCategory.findUnique({ where: { slug } });

    if (!existing || existing.id === subCategoryIdToIgnore) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

async function buildSubCategoryResponses(subCategories) {
  const productCounts = await prisma.product.groupBy({
    by: ["subCategoryId"],
    where: {
      subCategoryId: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
  });
  const productCountMap = new Map(
    productCounts.map((item) => [item.subCategoryId, item._count._all]),
  );

  return subCategories.map((subCategory) => ({
    id: subCategory.id,
    name: subCategory.name,
    slug: subCategory.slug,
    description: subCategory.description,
    image: subCategory.image,
    categoryId: subCategory.categoryId,
    category: subCategory.category ?? null,
    status: subCategory.status,
    sortOrder: subCategory.sortOrder,
    productCount: productCountMap.get(subCategory.id) ?? 0,
    createdAt: subCategory.createdAt,
    updatedAt: subCategory.updatedAt,
  }));
}

export async function getSubCategories(req, res) {
  try {
    const includeArchived = req.query.includeArchived === "true";
    const subCategories = await prisma.subCategory.findMany({
      where: includeArchived ? undefined : { status: "ACTIVE" },
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return res.json(await buildSubCategoryResponses(subCategories));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load sub-categories",
      error: error.message,
    });
  }
}

export async function getSubCategoryById(req, res) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid sub-category id" });
    }

    const subCategory = await prisma.subCategory.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!subCategory) {
      return res.status(404).json({ message: "Sub-category not found" });
    }

    const [response] = await buildSubCategoryResponses([subCategory]);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load sub-category",
      error: error.message,
    });
  }
}

export async function getSubCategoriesByCategory(req, res) {
  try {
    const categoryId = parseId(req.params.categoryId);

    if (!categoryId) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const subCategories = await prisma.subCategory.findMany({
      where: {
        categoryId,
        ...(req.query.includeArchived === "true" ? {} : { status: "ACTIVE" }),
      },
      include: { category: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return res.json(await buildSubCategoryResponses(subCategories));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load sub-categories",
      error: error.message,
    });
  }
}

async function validateCategory(categoryId) {
  if (!categoryId) return null;

  return prisma.productCategory.findUnique({ where: { id: categoryId } });
}

export async function createSubCategory(req, res) {
  try {
    const name = normalizeName(req.body?.name);
    const categoryId = parseId(req.body?.categoryId);

    if (!name) {
      return res.status(400).json({ message: "Sub-category name is required" });
    }

    const category = await validateCategory(categoryId);

    if (!category) {
      return res.status(400).json({ message: "Valid parent category is required" });
    }

    const requestedSlug = normalizeName(req.body?.slug);
    const slug = await getUniqueSubCategorySlug(requestedSlug || name);
    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        slug,
        description: req.body?.description?.trim() || null,
        image: req.body?.image?.trim() || null,
        categoryId,
        status: normalizeCatalogStatus(req.body?.status),
        sortOrder: parseSortOrder(req.body?.sortOrder),
      },
      include: { category: true },
    });
    const [response] = await buildSubCategoryResponses([subCategory]);

    return res.status(201).json(response);
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "A sub-category with that name or slug already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create sub-category",
      error: error.message,
    });
  }
}

export async function updateSubCategory(req, res) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid sub-category id" });
    }

    const existingSubCategory = await prisma.subCategory.findUnique({
      where: { id },
    });

    if (!existingSubCategory) {
      return res.status(404).json({ message: "Sub-category not found" });
    }

    const name = normalizeName(req.body?.name);
    const categoryId = parseId(req.body?.categoryId);

    if (!name) {
      return res.status(400).json({ message: "Sub-category name is required" });
    }

    const category = await validateCategory(categoryId);

    if (!category) {
      return res.status(400).json({ message: "Valid parent category is required" });
    }

    const requestedSlug = normalizeName(req.body?.slug);
    const slug = await getUniqueSubCategorySlug(requestedSlug || name, id);
    const subCategory = await prisma.subCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description: req.body?.description?.trim() || null,
        image: req.body?.image?.trim() || null,
        categoryId,
        status: normalizeCatalogStatus(req.body?.status),
        sortOrder: parseSortOrder(req.body?.sortOrder),
      },
      include: { category: true },
    });
    const [response] = await buildSubCategoryResponses([subCategory]);

    return res.json(response);
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "A sub-category with that name or slug already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update sub-category",
      error: error.message,
    });
  }
}

export async function deleteSubCategory(req, res) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid sub-category id" });
    }

    const existingSubCategory = await prisma.subCategory.findUnique({
      where: { id },
    });

    if (!existingSubCategory) {
      return res.status(404).json({ message: "Sub-category not found" });
    }

    const productCount = await prisma.product.count({
      where: { subCategoryId: id },
    });

    if (productCount > 0) {
      const subCategory = await prisma.subCategory.update({
        where: { id },
        data: { status: "ARCHIVED" },
        include: { category: true },
      });
      const [response] = await buildSubCategoryResponses([subCategory]);

      return res.json({
        message: "Sub-category archived because it is assigned to products",
        subCategory: response,
      });
    }

    await prisma.subCategory.delete({ where: { id } });

    return res.json({ message: "Sub-category deleted" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete sub-category",
      error: error.message,
    });
  }
}
