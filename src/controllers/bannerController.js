import prisma from "../prisma/client.js";

// GET active banners (for app)
export const getBanners = async (req, res) => {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  res.json({ data: banners });
};

// ADMIN: create banner
export const createBanner = async (req, res) => {
  const { image, title, subtitle, cta, link, order } = req.body;

  const banner = await prisma.banner.create({
    data: {
      image,
      title,
      subtitle,
      cta,
      link,
      order: order || 0,
    },
  });

  res.json(banner);
};

// ADMIN: delete banner
export const deleteBanner = async (req, res) => {
  const id = Number(req.params.id);

  await prisma.banner.delete({ where: { id } });

  res.json({ success: true });
};