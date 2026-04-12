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
