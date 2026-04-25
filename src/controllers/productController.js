import { prisma } from "../config/prisma.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../utils/apiPagination.js";
import {
  buildPublicImageUrl,
  buildProductResponse,
  deleteManagedImageFiles,
  getUploadedImagePaths,
  normalizeStoredGalleryImages,
  parseGalleryField,
  toStoredImagePath,
} from "../utils/productImageUtils.js";
import { timeQuery } from "../utils/queryTiming.js";
const PRODUCT_INCLUDE = {
  category: true,
  productmedia: true,
  producttag: true,
  options: {
    include: {
      values: true,
    },
  },
  variants: {
    include: {
      selections: {
        include: {
          option: true,
          optionValue: true,
        },
      },
    },
  },
};
const PRODUCT_LIST_INCLUDE = {
  category: true,
  productmedia: {
    orderBy: { position: "asc" },
    take: 1,
  },
  variants: {
    where: { isDefault: true },
    orderBy: { position: "asc" },
    take: 1,
  },
};

function getUploadedFiles(req, fieldName) {
  if (!req.files || typeof req.files !== "object") return [];

  const files = req.files[fieldName];
  return Array.isArray(files) ? files : [];
}
function parseCategoryId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseQueryBoolean(value) {
  const normalized = String(Array.isArray(value) ? value[0] : value)
    .trim()
    .toLowerCase();

  return normalized === "true" || normalized === "1";
}

function buildProductListResponse(product, req) {
  const defaultVariant = product.variants?.[0] ?? null;
  const image =
    defaultVariant?.image ??
    product.featuredImage ??
    product.productmedia?.[0]?.url ??
    null;

  return {
    id: product.id,
    name: product.title,
    price: defaultVariant?.price ?? 0,
    image: buildPublicImageUrl(image, req) || null,
    category: product.category ?? product.categoryLegacy,
    defaultVariant,
  };
}

function normalizeProductStatus(status) {
  const normalized = String(status ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (normalized === "ACTIVE") return "ACTIVE";
  if (normalized === "ARCHIVED") return "ARCHIVED";
  return "DRAFT";
}

function normalizeVariantStatus(status, stock) {
  const normalized = String(status ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (stock === 0 || normalized === "OUT_OF_STOCK") return "OUT_OF_STOCK";
  if (normalized === "ARCHIVED") return "ARCHIVED";
  return "ACTIVE";
}

function slugify(value) {
  const slug = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "product";
}

async function getUniqueSlug(title, productIdToIgnore) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });

    if (!existing || existing.id === productIdToIgnore) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

function normalizeOptions(rawOptions) {
  return parseJsonArray(rawOptions)
    .map((option, optionIndex) => {
      const name = String(option?.name ?? "").trim();
      const values = parseJsonArray(option?.values)
        .map((value, valueIndex) => ({
          value: String(value?.value ?? value ?? "").trim(),
          position: Number(value?.position ?? valueIndex),
        }))
        .filter((value) => value.value);

      return {
        name,
        position: Number(option?.position ?? optionIndex),
        values,
      };
    })
    .filter((option) => option.name && option.values.length > 0);
}

function normalizeSelectedOptions(rawSelectedOptions) {
  if (Array.isArray(rawSelectedOptions)) {
    return rawSelectedOptions
      .map((selection) => ({
        optionName: String(selection?.optionName ?? selection?.name ?? "").trim(),
        value: String(selection?.value ?? selection?.optionValue ?? "").trim(),
      }))
      .filter((selection) => selection.optionName && selection.value);
  }

  if (rawSelectedOptions && typeof rawSelectedOptions === "object") {
    return Object.entries(rawSelectedOptions)
      .map(([optionName, value]) => ({
        optionName: String(optionName).trim(),
        value: String(value).trim(),
      }))
      .filter((selection) => selection.optionName && selection.value);
  }

  return [];
}

function normalizeVariants(rawVariants, fallback) {
  const variants = parseJsonArray(rawVariants).map((variant, index) => {
    const stock = Number(variant?.stock ?? fallback.stock ?? 0);
    const price = Number(variant?.price ?? fallback.price ?? 0);

    return {
      id: Number.isInteger(Number(variant?.id)) ? Number(variant.id) : undefined,
      title: String(variant?.title ?? "").trim(),
      sku: String(variant?.sku ?? "").trim() || null,
      barcode: String(variant?.barcode ?? "").trim() || null,
      price,
      compareAtPrice: parseOptionalNumber(variant?.compareAtPrice),
      costPerItem: parseOptionalNumber(variant?.costPerItem),
      stock,
      trackQuantity: variant?.trackQuantity === false ? false : true,
      continueSellingWhenOutOfStock:
        variant?.continueSellingWhenOutOfStock === true,
      weight: parseOptionalNumber(variant?.weight),
      weightUnit: variant?.weightUnit || null,
      image: variant?.image ? String(variant.image).trim() : null,
      imageFileKey: variant?.imageFileKey
        ? String(variant.imageFileKey).trim()
        : null,
      isDefault: variant?.isDefault === true,
      position: Number(variant?.position ?? index),
      status: normalizeVariantStatus(variant?.status, stock),
      selectedOptions: normalizeSelectedOptions(variant?.selectedOptions),
    };
  });

  if (!variants.length) {
    return [
      {
        title: "Default Title",
        sku: null,
        barcode: null,
        price: fallback.price,
        compareAtPrice: null,
        costPerItem: null,
        stock: fallback.stock,
        trackQuantity: true,
        continueSellingWhenOutOfStock: false,
        weight: null,
        weightUnit: null,
        image: fallback.image,
        isDefault: true,
        position: 0,
        status: normalizeVariantStatus(fallback.status, fallback.stock),
        selectedOptions: [],
      },
    ];
  }

  if (!variants.some((variant) => variant.isDefault)) {
    variants[0].isDefault = true;
  }

  return variants.map((variant, index) => ({
    ...variant,
    title: variant.title || "Default Title",
    isDefault:
      variants.findIndex((candidate) => candidate.isDefault) === index,
  }));
}

function generateVariantsFromOptions(options, fallback) {
  if (!options.length) return [];

  const combinations = options.reduce(
    (acc, option) =>
      acc.flatMap((selection) =>
        option.values.map((value) => [
          ...selection,
          { optionName: option.name, value: value.value },
        ]),
      ),
    [[]],
  );

  return combinations.map((selectedOptions, index) => ({
    title: selectedOptions.map((selection) => selection.value).join(" / "),
    sku: null,
    barcode: null,
    price: fallback.price,
    compareAtPrice: null,
    costPerItem: null,
    stock: index === 0 ? fallback.stock : 0,
    trackQuantity: true,
    continueSellingWhenOutOfStock: false,
    weight: null,
    weightUnit: null,
    image: fallback.image,
    isDefault: index === 0,
    position: index,
    status: normalizeVariantStatus(
      index === 0 ? fallback.status : null,
      index === 0 ? fallback.stock : 0,
    ),
    selectedOptions,
  }));
}

function buildVariantData(variant, productId) {
  const now = new Date();

  return {
    productId,
    title: variant.title,
    sku: variant.sku,
    barcode: variant.barcode,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    costPerItem: variant.costPerItem,
    stock: variant.stock,
    trackQuantity: variant.trackQuantity,
    continueSellingWhenOutOfStock: variant.continueSellingWhenOutOfStock,
    weight: variant.weight,
    weightUnit: variant.weightUnit,
    image: variant.image,
    isDefault: variant.isDefault,
    position: variant.position,
    status: variant.status,
    updatedAt: now,
  };
}

async function replaceProductOptions(tx, productId, options) {
  await tx.productOption.deleteMany({ where: { productId } });

  const optionValueMap = new Map();

  for (const option of options) {
    const createdOption = await tx.productOption.create({
      data: {
        productId,
        name: option.name,
        position: option.position,
        values: {
          create: option.values.map((value) => ({
            value: value.value,
            position: value.position,
          })),
        },
      },
      include: { values: true },
    });

    for (const value of createdOption.values) {
      optionValueMap.set(`${createdOption.name}::${value.value}`, {
        optionId: createdOption.id,
        optionValueId: value.id,
      });
    }
  }

  return optionValueMap;
}

async function syncProductVariants(tx, productId, variants, optionValueMap) {
  const existingVariants = await tx.productVariant.findMany({
    where: { productId },
    include: { orderItems: { select: { id: true } } },
  });
  const submittedIds = new Set(
    variants.map((variant) => variant.id).filter(Boolean),
  );

  for (const existingVariant of existingVariants) {
    if (submittedIds.has(existingVariant.id)) continue;

    if (existingVariant.orderItems.length > 0) {
      await tx.productVariant.update({
        where: { id: existingVariant.id },
        data: {
          isDefault: false,
          status: "ARCHIVED",
        },
      });
    } else {
      await tx.productVariant.delete({ where: { id: existingVariant.id } });
    }
  }

  for (const variant of variants) {
    const data = buildVariantData(variant, productId);
    const savedVariant = variant.id
      ? await tx.productVariant.update({
          where: { id: variant.id },
          data,
        })
      : await tx.productVariant.create({ data });

    await tx.variantSelection.deleteMany({
      where: { variantId: savedVariant.id },
    });

    for (const selection of variant.selectedOptions) {
      const mapped = optionValueMap.get(
        `${selection.optionName}::${selection.value}`,
      );

      if (!mapped) {
        throw new Error(
          `Invalid option selection: ${selection.optionName} / ${selection.value}`,
        );
      }

      await tx.variantSelection.create({
        data: {
          variantId: savedVariant.id,
          optionId: mapped.optionId,
          optionValueId: mapped.optionValueId,
        },
      });
    }
  }
}

async function getProductWithRelations(id) {
  return prisma.product.findUnique({
    where: { id },
    include: PRODUCT_INCLUDE,
  });
}

export async function getProducts(req, res) {
  try {
    const { category, search, sort } = req.query;
    const categoryFilter = String(category ?? "").trim();
    const searchFilter = String(search ?? "").trim();
    const detail = parseQueryBoolean(req.query.detail);
    const pagination = getPaginationParams(req.query);
    const { page, limit, isPaginated } = pagination;
    console.log("Pagination:", { page, limit, isPaginated });
    const where = {
      ...(categoryFilter
        ? {
            OR: [
              { categoryLegacy: categoryFilter },
              { category: { is: { name: categoryFilter } } },
            ],
          }
        : {}),
      ...(searchFilter
        ? {
            OR: [
              { title: { contains: searchFilter } },
              { categoryLegacy: { contains: searchFilter } },
              { category: { is: { name: { contains: searchFilter } } } },
              { vendor: { contains: searchFilter } },
              { productType: { contains: searchFilter } },
            ],
          }
        : {}),
    };
    const queryContext = {
      route: "GET /api/products",
      page: isPaginated ? page : undefined,
      limit: isPaginated ? limit : undefined,
      detail: detail || undefined,
    };
    const include =
      isPaginated && !detail
        ? PRODUCT_LIST_INCLUDE
        : PRODUCT_INCLUDE;

    const [total, products] = isPaginated
      ? await Promise.all([
          timeQuery(
            "products.count",
            () => prisma.product.count({ where }),
            queryContext,
          ),
          timeQuery(
            "products.findMany",
            () =>
              prisma.product.findMany({
                where,
                include,
                orderBy: { createdAt: "desc" },
                skip: pagination.skip,
                take: pagination.take,
              }),
            queryContext,
          ),
        ])
      : [
          null,
          await timeQuery(
            "products.findMany",
            () =>
              prisma.product.findMany({
                where,
                include: PRODUCT_INCLUDE,
                orderBy: { createdAt: "desc" },
              }),
            queryContext,
          ),
        ];

    const response =
      isPaginated && !detail
        ? products.map((product) => buildProductListResponse(product, req))
        : products.map((product) => buildProductResponse(product, req));

    if (sort === "price_asc") {
      response.sort((left, right) => left.price - right.price);
    }

    if (sort === "price_desc") {
      response.sort((left, right) => right.price - left.price);
    }

    if (sort === "rating_desc") {
      response.sort((left, right) => (right.rating ?? 0) - (left.rating ?? 0));
    }

    if (isPaginated) {
      return res.json({
        data: response,
        pagination: buildPaginationMeta({
          page,
          limit,
          total,
        }),
      });
    }

    return res.json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
}

export async function getProductById(req, res) {
  try {
    const productId = Number(req.params.id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await getProductWithRelations(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(buildProductResponse(product, req));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
}

export async function createProduct(req, res) {
  const uploadedPrimaryImagePaths = getUploadedImagePaths(
    getUploadedFiles(req, "primaryImage"),
  );
  const uploadedGalleryImagePaths = getUploadedImagePaths(
    getUploadedFiles(req, "galleryImages"),
  );
  const uploadedVariantImagePaths = getUploadedImagePaths(
    getUploadedFiles(req, "variantImages"),
  );
  const uploadedImagePaths = [
    ...uploadedPrimaryImagePaths,
    ...uploadedGalleryImagePaths,
    ...uploadedVariantImagePaths,
  ];

  try {
    const {
      name,
      title,
      description,
      price,
      image,
      category,
      stock,
      status,
      productType,
      vendor,
      seoTitle,
      seoDescription,
    } = req.body;
    const productTitle = String(title ?? name ?? "").trim();

    if (!productTitle || price === undefined || !category) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res.status(400).json({
        message: "Name, price, and category are required",
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock ?? 0);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res.status(400).json({ message: "Invalid price" });
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res
        .status(400)
        .json({ message: "Stock must be a non-negative integer" });
    }

    const primaryImage =
      uploadedPrimaryImagePaths[0] ?? toStoredImagePath(image, req);

    if (!primaryImage) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res.status(400).json({
        message: "A primary product image is required",
      });
    }

    const galleryImages = Array.from(
      new Set([
        ...parseGalleryField(req.body.images, req),
        ...uploadedGalleryImagePaths,
      ]),
    );
    const options = normalizeOptions(req.body.options);
    const fallback = {
      price: parsedPrice,
      stock: parsedStock,
      image: primaryImage,
      status,
    };
    const variants =
      parseJsonArray(req.body.variants).length > 0
        ? normalizeVariants(req.body.variants, fallback)
        : options.length > 0
          ? generateVariantsFromOptions(options, fallback)
          : normalizeVariants([], fallback);
    const variantImageKeys = parseJsonArray(req.body.variantImageKeys).map(
      (key) => String(key),
    );
    const variantImageMap = new Map(
      variantImageKeys.map((key, index) => [
        key,
        uploadedVariantImagePaths[index],
      ]),
    );
    const variantsWithImages = variants.map((variant) => ({
      ...variant,
      image:
        variant.imageFileKey && variantImageMap.has(variant.imageFileKey)
          ? variantImageMap.get(variant.imageFileKey)
          : variant.image,
    }));
    const tags = parseJsonArray(req.body.tags)
      .map((tag) => String(tag).trim())
      .filter(Boolean);
    const slug = await getUniqueSlug(productTitle);

    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          title: productTitle,
          slug,
          description: description?.trim() ? description.trim() : null,
          status: normalizeProductStatus(status),
          productType: productType?.trim() || null,
          vendor: vendor?.trim() || null,
          categoryLegacy: category,
          categoryId: parseCategoryId(req.body.categoryId),
          featuredImage: primaryImage,
          seoTitle: seoTitle?.trim() || null,
          seoDescription: seoDescription?.trim() || null,
          updatedAt: new Date(),
          producttag: {
            create: tags.map((value) => ({ value })),
          },
          productmedia: {
            create: [primaryImage, ...galleryImages].map((url, position) => ({
              url,
              altText: productTitle,
              position,
            })),
          },
        },
      });

      const optionValueMap = await replaceProductOptions(
        tx,
        product.id,
        options,
      );
      await syncProductVariants(
        tx,
        product.id,
        variantsWithImages,
        optionValueMap,
      );

      return tx.product.findUnique({
        where: { id: product.id },
        include: PRODUCT_INCLUDE,
      });
    });

    return res.status(201).json(buildProductResponse(createdProduct, req));
  } catch (error) {
    await deleteManagedImageFiles(uploadedImagePaths);
    return res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
}

export async function updateProduct(req, res) {
  const uploadedPrimaryImagePaths = getUploadedImagePaths(
    getUploadedFiles(req, "primaryImage"),
  );
  const uploadedGalleryImagePaths = getUploadedImagePaths(
    getUploadedFiles(req, "galleryImages"),
  );
  const uploadedVariantImagePaths = getUploadedImagePaths(
    getUploadedFiles(req, "variantImages"),
  );
  const uploadedImagePaths = [
    ...uploadedPrimaryImagePaths,
    ...uploadedGalleryImagePaths,
    ...uploadedVariantImagePaths,
  ];

  try {
    const id = Number(req.params.id);
    const {
      name,
      title,
      description,
      price,
      image,
      category,
      stock,
      status,
      productType,
      vendor,
      seoTitle,
      seoDescription,
    } = req.body;
    const productTitle = String(title ?? name ?? "").trim();

    if (Number.isNaN(id)) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res.status(400).json({ message: "Invalid product id" });
    }

    if (!productTitle || price === undefined || !category) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res.status(400).json({
        message: "Name, price, and category are required",
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock ?? 0);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res.status(400).json({ message: "Invalid price" });
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res
        .status(400)
        .json({ message: "Stock must be a non-negative integer" });
    }

    const existingProduct = await getProductWithRelations(id);

    if (!existingProduct) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res.status(404).json({ message: "Product not found" });
    }

    const currentPrimaryImage = toStoredImagePath(
      existingProduct.featuredImage,
      req,
    );
    const currentGalleryImages = normalizeStoredGalleryImages(
      existingProduct.productmedia
        .filter((item) => item.url !== existingProduct.featuredImage)
        .map((item) => item.url),
      req,
    );
    const retainedGalleryImages =
      req.body.existingGalleryImages !== undefined
        ? parseGalleryField(req.body.existingGalleryImages, req)
        : currentGalleryImages;
    const nextPrimaryImage =
      uploadedPrimaryImagePaths[0] ??
      toStoredImagePath(image, req) ??
      currentPrimaryImage;

    if (!nextPrimaryImage) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res.status(400).json({
        message: "A primary product image is required",
      });
    }

    const nextGalleryImages = Array.from(
      new Set([...retainedGalleryImages, ...uploadedGalleryImagePaths]),
    );
    const options = normalizeOptions(req.body.options);
    const fallback = {
      price: parsedPrice,
      stock: parsedStock,
      image: nextPrimaryImage,
      status,
    };
    const variants =
      parseJsonArray(req.body.variants).length > 0
        ? normalizeVariants(req.body.variants, fallback)
        : options.length > 0
          ? generateVariantsFromOptions(options, fallback)
          : normalizeVariants(
            existingProduct.variants.length
              ? existingProduct.variants.map((variant) => ({
                  ...variant,
                  price: parsedPrice,
                  stock: parsedStock,
                  image: variant.image ?? nextPrimaryImage,
                  status,
                }))
              : [],
            fallback,
          );
    const variantImageKeys = parseJsonArray(req.body.variantImageKeys).map(
      (key) => String(key),
    );
    const variantImageMap = new Map(
      variantImageKeys.map((key, index) => [
        key,
        uploadedVariantImagePaths[index],
      ]),
    );
    const variantsWithImages = variants.map((variant) => ({
      ...variant,
      image:
        variant.imageFileKey && variantImageMap.has(variant.imageFileKey)
          ? variantImageMap.get(variant.imageFileKey)
          : variant.image,
    }));
    const tags = parseJsonArray(req.body.tags)
      .map((tag) => String(tag).trim())
      .filter(Boolean);
    const slug = await getUniqueSlug(productTitle, id);

    const updatedProduct = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          title: productTitle,
          slug,
          description: description?.trim() ? description.trim() : null,
          status: normalizeProductStatus(status),
          productType: productType?.trim() || null,
          vendor: vendor?.trim() || null,
          categoryLegacy: category,
          categoryId: parseCategoryId(req.body.categoryId),
          featuredImage: nextPrimaryImage,
          seoTitle: seoTitle?.trim() || null,
          seoDescription: seoDescription?.trim() || null,
          updatedAt: new Date(),
          producttag: {
            deleteMany: {},
            create: tags.map((value) => ({ value })),
          },
          productmedia: {
            deleteMany: {},
            create: [nextPrimaryImage, ...nextGalleryImages].map(
              (url, position) => ({
                url,
                altText: productTitle,
                position,
              }),
            ),
          },
        },
      });

      const optionValueMap = await replaceProductOptions(tx, id, options);
      await syncProductVariants(tx, id, variantsWithImages, optionValueMap);

      return tx.product.findUnique({
        where: { id },
        include: PRODUCT_INCLUDE,
      });
    });

    const removedGalleryImages = currentGalleryImages.filter(
      (item) => !retainedGalleryImages.includes(item),
    );
    const replacedPrimaryImage =
      currentPrimaryImage && currentPrimaryImage !== nextPrimaryImage
        ? [currentPrimaryImage]
        : [];
    const nextVariantImages = variantsWithImages
      .map((variant) => variant.image)
      .filter(Boolean);
    const removedVariantImages = existingProduct.variants
      .map((variant) => variant.image)
      .filter(Boolean)
      .filter((item) => !nextVariantImages.includes(item));

    await deleteManagedImageFiles([
      ...removedGalleryImages,
      ...replacedPrimaryImage,
      ...removedVariantImages,
    ]);

    return res.json(buildProductResponse(updatedProduct, req));
  } catch (error) {
    await deleteManagedImageFiles(uploadedImagePaths);
    return res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
}

export async function deleteProduct(req, res) {
  try {
    const id = Number(req.params.id);

    const existingProduct = await getProductWithRelations(id);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.delete({
      where: { id },
    });

    await deleteManagedImageFiles([
      existingProduct.featuredImage,
      ...existingProduct.productmedia.map((item) => item.url),
      ...existingProduct.variants.map((variant) => variant.image),
    ]);

    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
}
