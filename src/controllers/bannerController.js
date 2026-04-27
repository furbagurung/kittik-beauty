import { prisma } from "../config/prisma.js";

export const getBanners = async (_req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return res.json({ data: banners });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load banners",
      error: error.message,
    });
  }
};

export const createBanner = async (req, res) => {
  try {
    const { image, title, subtitle, cta, link, order } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Banner image is required" });
    }

    const banner = await prisma.banner.create({
      data: {
        image,
        title,
        subtitle,
        cta,
        link,
        order: Number(order || 0),
      },
    });

    return res.status(201).json(banner);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create banner",
      error: error.message,
    });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid banner id" });
    }

    await prisma.banner.delete({ where: { id } });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete banner",
      error: error.message,
    });
  }
};
