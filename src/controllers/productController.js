import { prisma } from "../config/prisma.js";

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

    return res.json(products);
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

    return res.json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
}
export async function createProduct(req, res) {
  try {
    const { name, description, price, image, category, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock ?? 0);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res
        .status(400)
        .json({ message: "Stock must be a non-negative integer" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parsedPrice,
        image,
        category,
        stock: parsedStock,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
}
export async function updateProduct(req, res) {
  try {
    const id = Number(req.params.id);
    const { name, description, price, image, category, stock } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        message: "Name, price, and category are required",
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock ?? 0);

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res
        .status(400)
        .json({ message: "Stock must be a non-negative integer" });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parsedPrice,
        image,
        category,
        stock: parsedStock,
      },
    });

    return res.json(updatedProduct);
  } catch (error) {
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

    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
}
