import { prisma } from "../config/prisma.js";

function normalizeProductPayload(body) {
  const name = String(body.name ?? "").trim();
  const image = String(body.image ?? "").trim();
  const category = String(body.category ?? "").trim();
  const price = Number(body.price);
  const ratingValue =
    body.rating === undefined || body.rating === null || body.rating === ""
      ? 0
      : Number(body.rating);

  if (!name || !image || !category) {
    return {
      error: "Name, image, and category are required",
    };
  }

  if (Number.isNaN(price) || price < 0) {
    return {
      error: "Price must be a valid positive number",
    };
  }

  if (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
    return {
      error: "Rating must be between 0 and 5",
    };
  }

  return {
    data: {
      name,
      image,
      category,
      price,
      rating: ratingValue,
    },
  };
}

export async function getAdminProducts(req, res) {
  try {
    const { search, category } = req.query;

    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category: String(category) } : {}),
        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: String(search),
                  },
                },
                {
                  category: {
                    contains: String(search),
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load admin products",
      error: error.message,
    });
  }
}

export async function createAdminProduct(req, res) {
  try {
    const { data, error } = normalizeProductPayload(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const product = await prisma.product.create({
      data,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
}

export async function updateAdminProduct(req, res) {
  try {
    const productId = Number(req.params.id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const { data, error } = normalizeProductPayload(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data,
    });

    return res.json(product);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
}

export async function deleteAdminProduct(req, res) {
  try {
    const productId = Number(req.params.id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
}
