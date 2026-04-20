import { prisma } from "../config/prisma.js";
import {
  buildProductResponse,
  deleteManagedImageFiles,
  getUploadedImagePaths,
  normalizeStoredGalleryImages,
  parseGalleryField,
  toStoredImagePath,
} from "../utils/productImageUtils.js";

function getUploadedFiles(req, fieldName) {
  if (!req.files || typeof req.files !== "object") {
    return [];
  }

  const files = req.files[fieldName];
  return Array.isArray(files) ? files : [];
}

export async function getProducts(req, res) {
  try {
    const { category, search, sort } = req.query;

    const where = {
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { category: { contains: search } },
            ],
          }
        : {}),
    };

    let orderBy = { createdAt: "desc" };

    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "rating_desc") orderBy = { rating: "desc" };

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    return res.json(products.map((product) => buildProductResponse(product, req)));
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

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

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
  const uploadedImagePaths = [
    ...uploadedPrimaryImagePaths,
    ...uploadedGalleryImagePaths,
  ];

  try {
    const { name, description, price, image, category, stock } = req.body;

    if (!name || price === undefined || !category) {
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

    const product = await prisma.product.create({
      data: {
        name,
        description: description?.trim() ? description.trim() : null,
        price: parsedPrice,
        image: primaryImage,
        category,
        stock: parsedStock,
        images: galleryImages,
      },
    });

    return res.status(201).json(buildProductResponse(product, req));
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
  const uploadedImagePaths = [
    ...uploadedPrimaryImagePaths,
    ...uploadedGalleryImagePaths,
  ];

  try {
    const id = Number(req.params.id);
    const { name, description, price, image, category, stock } = req.body;

    if (Number.isNaN(id)) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res.status(400).json({ message: "Invalid product id" });
    }

    if (!name || price === undefined || !category) {
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

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      await deleteManagedImageFiles(uploadedImagePaths);
      return res.status(404).json({ message: "Product not found" });
    }

    const currentPrimaryImage = toStoredImagePath(existingProduct.image, req);
    const currentGalleryImages = normalizeStoredGalleryImages(
      existingProduct.images,
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

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description?.trim() ? description.trim() : null,
        price: parsedPrice,
        image: nextPrimaryImage,
        category,
        stock: parsedStock,
        images: nextGalleryImages,
      },
    });

    const removedGalleryImages = currentGalleryImages.filter(
      (item) => !retainedGalleryImages.includes(item),
    );
    const replacedPrimaryImage =
      currentPrimaryImage && currentPrimaryImage !== nextPrimaryImage
        ? [currentPrimaryImage]
        : [];

    await deleteManagedImageFiles([
      ...removedGalleryImages,
      ...replacedPrimaryImage,
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

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.delete({
      where: { id },
    });

    await deleteManagedImageFiles([
      existingProduct.image,
      ...normalizeStoredGalleryImages(existingProduct.images, req),
    ]);

    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
}
