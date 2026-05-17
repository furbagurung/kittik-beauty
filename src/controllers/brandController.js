import { prisma } from "../config/prisma.js";
import {
  normalizeCatalogStatus,
  normalizeName,
  parseSortOrder,
  slugify,
} from "../utils/slugify.js";

async function getUniqueBrandSlug(name, brandIdToIgnore) {
  const baseSlug = slugify(name, "brand");
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.brand.findUnique({ where: { slug } });

    if (!existing || existing.id === brandIdToIgnore) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

async function buildBrandResponses(brands) {
  const productCounts = await prisma.product.groupBy({
    by: ["brandId"],
    where: {
      brandId: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
  });
  const productCountMap = new Map(
    productCounts.map((item) => [item.brandId, item._count._all]),
  );

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logo: brand.logo,
    status: brand.status,
    sortOrder: brand.sortOrder,
    productCount: productCountMap.get(brand.id) ?? 0,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  }));
}

export async function getBrands(req, res) {
  try {
    const includeArchived = req.query.includeArchived === "true";
    const brands = await prisma.brand.findMany({
      where: includeArchived ? undefined : { status: "ACTIVE" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return res.json(await buildBrandResponses(brands));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load brands",
      error: error.message,
    });
  }
}

export async function getBrandById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid brand id" });
    }

    const brand = await prisma.brand.findUnique({ where: { id } });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const [response] = await buildBrandResponses([brand]);
    return res.json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load brand",
      error: error.message,
    });
  }
}

export async function createBrand(req, res) {
  try {
    const name = normalizeName(req.body?.name);

    if (!name) {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const requestedSlug = normalizeName(req.body?.slug);
    const slug = await getUniqueBrandSlug(requestedSlug || name);
    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        description: req.body?.description?.trim() || null,
        logo: req.body?.logo?.trim() || null,
        status: normalizeCatalogStatus(req.body?.status),
        sortOrder: parseSortOrder(req.body?.sortOrder),
      },
    });
    const [response] = await buildBrandResponses([brand]);

    return res.status(201).json(response);
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "A brand with that name or slug already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create brand",
      error: error.message,
    });
  }
}

export async function updateBrand(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid brand id" });
    }

    const existingBrand = await prisma.brand.findUnique({ where: { id } });

    if (!existingBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const name = normalizeName(req.body?.name);

    if (!name) {
      return res.status(400).json({ message: "Brand name is required" });
    }

    const requestedSlug = normalizeName(req.body?.slug);
    const slug = await getUniqueBrandSlug(requestedSlug || name, id);
    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        slug,
        description: req.body?.description?.trim() || null,
        logo: req.body?.logo?.trim() || null,
        status: normalizeCatalogStatus(req.body?.status),
        sortOrder: parseSortOrder(req.body?.sortOrder),
      },
    });
    const [response] = await buildBrandResponses([brand]);

    return res.json(response);
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "A brand with that name or slug already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update brand",
      error: error.message,
    });
  }
}

export async function deleteBrand(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid brand id" });
    }

    const existingBrand = await prisma.brand.findUnique({ where: { id } });

    if (!existingBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const productCount = await prisma.product.count({ where: { brandId: id } });

    if (productCount > 0) {
      const brand = await prisma.brand.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });
      const [response] = await buildBrandResponses([brand]);

      return res.json({
        message: "Brand archived because it is assigned to products",
        brand: response,
      });
    }

    await prisma.brand.delete({ where: { id } });

    return res.json({ message: "Brand deleted" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete brand",
      error: error.message,
    });
  }
}
