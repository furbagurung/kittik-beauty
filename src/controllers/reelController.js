import { prisma } from "../config/prisma.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../utils/apiPagination.js";
import {
  buildPublicImageUrl,
  deleteManagedImageFiles,
  toStoredImagePath,
} from "../utils/productImageUtils.js";
import { timeQuery } from "../utils/queryTiming.js";
import {
  buildGeneratedReelThumbnailPaths,
  generateReelThumbnail,
  reelPublicPathToAbsolutePath,
} from "../utils/reelThumbnailUtils.js";

const REEL_INCLUDE = (userId) => {
  const include = {
    user: {
      select: {
        id: true,
        name: true,
      },
    },
    reelproducttag: {
      orderBy: { sortOrder: "asc" },
      include: {
        product: {
          include: {
            category: true,
            productmedia: {
              orderBy: { position: "asc" },
            },
            variants: {
              orderBy: { position: "asc" },
            },
          },
        },
        productVariant: true,
      },
    },
    _count: {
      select: {
        reellike: true,
        reelsave: true,
      },
    },
  };

  if (userId) {
    include.reellike = {
      where: {
        userId,
      },
      select: {
        id: true,
      },
    };
    include.reelsave = {
      where: {
        userId,
      },
      select: {
        id: true,
      },
    };
  }

  return include;
};

const REEL_LIST_INCLUDE = (userId) => {
  const include = {
    user: {
      select: {
        id: true,
        name: true,
      },
    },
    reelproducttag: {
      orderBy: { sortOrder: "asc" },
      include: {
        product: {
          include: {
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
          },
        },
        productVariant: {
          select: {
            id: true,
            title: true,
            price: true,
            image: true,
          },
        },
      },
    },
    _count: {
      select: {
        reellike: true,
        reelsave: true,
      },
    },
  };

  if (userId) {
    include.reellike = {
      where: {
        userId,
      },
      select: {
        id: true,
      },
    };
    include.reelsave = {
      where: {
        userId,
      },
      select: {
        id: true,
      },
    };
  }

  return include;
};

function getUploadedFiles(req, fieldName) {
  if (!req.files || typeof req.files !== "object") return [];

  const files = req.files[fieldName];
  return Array.isArray(files) ? files : [];
}

function getUploadedReelPaths(files = []) {
  return files
    .map((file) => file?.filename)
    .filter(Boolean)
    .map((filename) => `/uploads/reels/${filename}`);
}

function logAutoThumbnailSkipped(context, reason, details = {}) {
  console.info("Auto thumbnail skipped:", {
    context,
    reason,
    ...details,
  });
}

async function tryGenerateReelThumbnail(videoUrl, context) {
  const videoPath = reelPublicPathToAbsolutePath(videoUrl);
  const thumbnailPaths = buildGeneratedReelThumbnailPaths(videoUrl);

  if (!videoPath || !thumbnailPaths) {
    logAutoThumbnailSkipped(context, "video path is not a managed reel upload", {
      videoUrl,
    });
    return null;
  }

  try {
    await generateReelThumbnail(videoPath, thumbnailPaths.absolutePath);
    console.info("Auto thumbnail generated:", {
      context,
      videoUrl,
      thumbnailUrl: thumbnailPaths.publicPath,
    });
    return thumbnailPaths.publicPath;
  } catch (error) {
    console.error("Auto thumbnail failed:", {
      context,
      videoUrl,
      outputPath: thumbnailPaths.absolutePath,
      error: error?.message || error,
    });
    return null;
  }
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

function parseOptionalInteger(value) {
  if (value === undefined || value === null || value === "") return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function parseBoolean(value) {
  if (value === true || value === "true" || value === "1" || value === 1) {
    return true;
  }

  return false;
}

function normalizeReelStatus(value) {
  const normalized = String(value ?? "").trim().toUpperCase();

  if (normalized === "ACTIVE") return "ACTIVE";
  if (normalized === "ARCHIVED") return "ARCHIVED";
  return "DRAFT";
}

function normalizeProductTags(value) {
  return parseJsonArray(value)
    .map((tag, index) => ({
      productId: Number(tag?.productId),
      variantId:
        tag?.variantId === undefined ||
        tag?.variantId === null ||
        tag?.variantId === ""
          ? null
          : Number(tag.variantId),
      ctaLabel: String(tag?.ctaLabel ?? "Shop now").trim() || "Shop now",
      sortOrder: Number(tag?.sortOrder ?? index),
    }))
    .filter(
      (tag) =>
        Number.isInteger(tag.productId) &&
        tag.productId > 0 &&
        (tag.variantId === null ||
          (Number.isInteger(tag.variantId) && tag.variantId > 0)),
    );
}

async function getReelEventCounts(reelIds = []) {
  const ids = Array.from(
    new Set(
      reelIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  );

  if (!ids.length) return new Map();

  const counts = new Map(
    ids.map((id) => [
      id,
      {
        productClickCount: 0,
        shareCount: 0,
      },
    ]),
  );

  if (!prisma.reelevent?.groupBy) {
    console.warn(
      "Reel analytics counts unavailable: Prisma reelEvent delegate is missing.",
    );
    return counts;
  }

  const rows = await prisma.reelevent.groupBy({
    by: ["reelId", "type"],
    where: {
      reelId: {
        in: ids,
      },
    },
    _count: {
      _all: true,
    },
  });

  for (const row of rows) {
    const current = counts.get(row.reelId) ?? {
      productClickCount: 0,
      shareCount: 0,
    };

    if (row.type === "SHARE") {
      current.shareCount = row._count._all;
    }

    if (row.type === "PRODUCT_CLICK") {
      current.productClickCount = row._count._all;
    }

    counts.set(row.reelId, current);
  }

  return counts;
}

function buildProductPreview(product, variant, req) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const defaultVariant =
    variant ??
    variants.find((candidate) => candidate.isDefault) ??
    variants[0] ??
    null;
  const media = Array.isArray(product?.productmedia) ? product.productmedia : [];
  const image =
    defaultVariant?.image ?? product?.featuredImage ?? media[0]?.url ?? null;

  return {
    id: product.id,
    name: product.title,
    category: product.category ?? product.categoryLegacy,
    categoryId: product.categoryId,
    price: defaultVariant?.price ?? 0,
    image: buildPublicImageUrl(image, req) || undefined,
  };
}

function buildReelResponse(reel, req, eventCounts) {
  const analytics = eventCounts?.get(reel.id) ?? {
    productClickCount: 0,
    shareCount: 0,
  };

  return {
    id: reel.id,
    title: reel.title,
    caption: reel.caption ?? "",
    videoUrl: buildPublicImageUrl(reel.videoUrl, req) || reel.videoUrl,
    thumbnailUrl:
      buildPublicImageUrl(reel.thumbnailUrl, req) || reel.thumbnailUrl || null,
    duration: reel.duration,
    status: reel.status,
    featured: reel.featured,
    sortOrder: reel.sortOrder,
    createdAt: reel.createdAt,
    updatedAt: reel.updatedAt,
    creatorName: reel.user?.name ?? "Kittik Beauty",
    viewCount: reel.viewCount,
    likeCount: reel._count?.reellike ?? 0,
    saveCount: reel._count?.reelsave ?? 0,
    shareCount: analytics.shareCount,
    productClickCount: analytics.productClickCount,
    likedByMe: Array.isArray(reel.reellike) && reel.reellike.length > 0,
    savedByMe: Array.isArray(reel.reelsave) && reel.reelsave.length > 0,
    productTags: [...(reel.reelproducttag ?? [])]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((tag) => ({
        id: tag.id,
        productId: tag.productId,
        variantId: tag.variantId,
        ctaLabel: tag.ctaLabel,
        sortOrder: tag.sortOrder,
        product: buildProductPreview(tag.product, tag.productVariant, req),
        variant: tag.productVariant
          ? {
              id: tag.productVariant.id,
              title: tag.productVariant.title,
              price: tag.productVariant.price,
              image:
                buildPublicImageUrl(tag.productVariant.image, req) ||
                tag.productVariant.image,
            }
          : null,
      })),
  };
}

async function getReelWithRelations(id, userId) {
  return prisma.reel.findUnique({
    where: { id },
    include: REEL_INCLUDE(userId),
  });
}

export async function getReels(req, res) {
  try {
    const userId = req.user?.id ? Number(req.user.id) : null;
    const pagination = getPaginationParams(req.query);
    const { page, limit, isPaginated } = pagination;
    const where = {
      status: "ACTIVE",
    };
    const orderBy = [
      { featured: "desc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ];
    const queryContext = {
      route: "GET /api/reels",
      page: isPaginated ? page : undefined,
      limit: isPaginated ? limit : undefined,
    };

    const [total, reels] = isPaginated
      ? await Promise.all([
          timeQuery(
            "reels.count",
            () => prisma.reel.count({ where }),
            queryContext,
          ),
          timeQuery(
            "reels.findMany",
            () =>
              prisma.reel.findMany({
                where,
                orderBy,
                include: REEL_LIST_INCLUDE(userId),
                skip: pagination.skip,
                take: pagination.take,
              }),
            queryContext,
          ),
        ])
      : [
          null,
          await timeQuery(
            "reels.findMany",
            () =>
              prisma.reel.findMany({
                where,
                orderBy,
                include: REEL_INCLUDE(userId),
              }),
            queryContext,
          ),
        ];

    const eventCounts = await timeQuery(
      "reels.eventCounts",
      () => getReelEventCounts(reels.map((reel) => reel.id)),
      queryContext,
    );
    const response = reels.map((reel) =>
      buildReelResponse(reel, req, eventCounts),
    );

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
      message: "Failed to load reels",
      error: error.message,
    });
  }
}

export async function getReelById(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid reel id" });
    }

    const userId = req.user?.id ? Number(req.user.id) : null;
    const reel = await getReelWithRelations(id, userId);

    if (!reel || reel.status !== "ACTIVE") {
      return res.status(404).json({ message: "Reel not found" });
    }

    const eventCounts = await getReelEventCounts([reel.id]);

    return res.json(buildReelResponse(reel, req, eventCounts));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load reel",
      error: error.message,
    });
  }
}

export async function getAdminReels(req, res) {
  try {
    const userId = req.user?.id ? Number(req.user.id) : null;
    const reels = await prisma.reel.findMany({
      orderBy: [
        { featured: "desc" },
        { sortOrder: "asc" },
        { updatedAt: "desc" },
      ],
      include: REEL_INCLUDE(userId),
    });
    const eventCounts = await getReelEventCounts(reels.map((reel) => reel.id));

    return res.json(
      reels.map((reel) => buildReelResponse(reel, req, eventCounts)),
    );
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load reels",
      error: error.message,
    });
  }
}

export async function getAdminReelById(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid reel id" });
    }

    const userId = req.user?.id ? Number(req.user.id) : null;
    const reel = await getReelWithRelations(id, userId);

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    const eventCounts = await getReelEventCounts([reel.id]);

    return res.json(buildReelResponse(reel, req, eventCounts));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load reel",
      error: error.message,
    });
  }
}

export async function trackReelView(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid reel id" });
    }

    const reel = await prisma.reel.findFirst({
      where: {
        id,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    const watchedSeconds = Math.max(
      0,
      Math.floor(Number(req.body?.watchedSeconds ?? 0) || 0),
    );
    const completed = parseBoolean(req.body?.completed);
    const userId = req.user?.id ? Number(req.user.id) : null;

    const [, updatedReel] = await prisma.$transaction([
      prisma.reelview.create({
        data: {
          reelId: id,
          userId,
          watchedSeconds,
          completed,
        },
      }),
      prisma.reel.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
        select: {
          viewCount: true,
        },
      }),
    ]);

    return res.status(201).json({ viewCount: updatedReel.viewCount });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to track reel view",
      error: error.message,
    });
  }
}

export async function trackReelShare(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid reel id" });
    }

    const reel = await prisma.reel.findFirst({
      where: {
        id,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    await prisma.reelevent.create({
      data: {
        reelId: id,
        userId: req.user?.id ? Number(req.user.id) : null,
        type: "SHARE",
        metadata: JSON.stringify({
          channel: String(req.body?.channel ?? "native-share"),
        }),
      },
    });

    const shareCount = await prisma.reelevent.count({
      where: {
        reelId: id,
        type: "SHARE",
      },
    });

    return res.status(201).json({ shareCount });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to track reel share",
      error: error.message,
    });
  }
}

export async function trackReelProductClick(req, res) {
  try {
    const id = Number(req.params.id);
    const productId = Number(req.body?.productId);
    const variantId =
      req.body?.variantId === undefined ||
        req.body?.variantId === null ||
        req.body?.variantId === ""
        ? null
        : Number(req.body.variantId);
    const reelProductTagId =
      req.body?.reelProductTagId === undefined ||
        req.body?.reelProductTagId === null ||
        req.body?.reelProductTagId === ""
        ? null
        : Number(req.body.reelProductTagId);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid reel id" });
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: "Product id is required" });
    }

    if (variantId !== null && (!Number.isInteger(variantId) || variantId <= 0)) {
      return res.status(400).json({ message: "Invalid variant id" });
    }

    if (
      reelProductTagId !== null &&
      (!Number.isInteger(reelProductTagId) || reelProductTagId <= 0)
    ) {
      return res.status(400).json({ message: "Invalid reel product tag id" });
    }

    const reel = await prisma.reel.findFirst({
      where: {
        id,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    await prisma.reelevent.create({
      data: {
        reelId: id,
        userId: req.user?.id ? Number(req.user.id) : null,
        productId,
        variantId,
        reelProductTagId,
        type: "PRODUCT_CLICK",
        metadata: JSON.stringify({
          source: String(req.body?.source ?? "reel-product-card"),
        }),
      },
    });

    const productClickCount = await prisma.reelevent.count({
      where: {
        reelId: id,
        type: "PRODUCT_CLICK",
      },
    });

    return res.status(201).json({ productClickCount });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to track product click",
      error: error.message,
    });
  }
}

export async function likeReel(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid reel id" });
    }

    const reel = await prisma.reel.findFirst({
      where: {
        id,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    await prisma.reellike.upsert({
      where: {
        reelId_userId: {
          reelId: id,
          userId,
        },
      },
      update: {},
      create: {
        reelId: id,
        userId,
      },
    });

    const likeCount = await prisma.reellike.count({ where: { reelId: id } });

    return res.status(201).json({ likedByMe: true, likeCount });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to like reel",
      error: error.message,
    });
  }
}

export async function unlikeReel(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid reel id" });
    }

    await prisma.reellike.deleteMany({
      where: {
        reelId: id,
        userId,
      },
    });

    const likeCount = await prisma.reellike.count({ where: { reelId: id } });

    return res.json({ likedByMe: false, likeCount });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to unlike reel",
      error: error.message,
    });
  }
}

export async function saveReel(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid reel id" });
    }

    const reel = await prisma.reel.findFirst({
      where: {
        id,
        status: "ACTIVE",
      },
      select: {
        id: true,
      },
    });

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    await prisma.reelsave.upsert({
      where: {
        reelId_userId: {
          reelId: id,
          userId,
        },
      },
      update: {},
      create: {
        reelId: id,
        userId,
      },
    });

    const saveCount = await prisma.reelsave.count({ where: { reelId: id } });

    return res.status(201).json({ savedByMe: true, saveCount });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save reel",
      error: error.message,
    });
  }
}

export async function unsaveReel(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user?.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid reel id" });
    }

    await prisma.reelsave.deleteMany({
      where: {
        reelId: id,
        userId,
      },
    });

    const saveCount = await prisma.reelsave.count({ where: { reelId: id } });

    return res.json({ savedByMe: false, saveCount });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to unsave reel",
      error: error.message,
    });
  }
}

export async function createReel(req, res) {
  const uploadedVideoPaths = getUploadedReelPaths(getUploadedFiles(req, "video"));
  const uploadedThumbnailPaths = getUploadedReelPaths(
    getUploadedFiles(req, "thumbnail"),
  );
  const uploadedPaths = [...uploadedVideoPaths, ...uploadedThumbnailPaths];

  try {
    const title = String(req.body.title ?? "").trim();
    const caption = String(req.body.caption ?? "").trim();
    const videoUrl = uploadedVideoPaths[0] ?? toStoredImagePath(req.body.videoUrl, req);
    let thumbnailUrl =
      uploadedThumbnailPaths[0] ?? toStoredImagePath(req.body.thumbnailUrl, req);
    const productTags = normalizeProductTags(req.body.productTags);

    if (!title || !videoUrl) {
      await deleteManagedImageFiles(uploadedPaths);
      return res.status(400).json({ message: "Title and video are required" });
    }

    if (thumbnailUrl) {
      logAutoThumbnailSkipped("createReel", "thumbnail already provided", {
        videoUrl,
        thumbnailUrl,
      });
    } else if (!uploadedVideoPaths[0]) {
      logAutoThumbnailSkipped("createReel", "video was not uploaded", {
        videoUrl,
      });
    } else {
      const generatedThumbnailUrl = await tryGenerateReelThumbnail(
        videoUrl,
        "createReel",
      );

      if (generatedThumbnailUrl) {
        thumbnailUrl = generatedThumbnailUrl;
        uploadedPaths.push(generatedThumbnailUrl);
      }
    }

    const createdReel = await prisma.reel.create({
      data: {
        title,
        caption: caption || null,
        videoUrl,
        thumbnailUrl,
        duration: parseOptionalInteger(req.body.duration),
        status: normalizeReelStatus(req.body.status),
        featured: parseBoolean(req.body.featured),
        sortOrder: Number(req.body.sortOrder ?? 0) || 0,
        createdById: Number(req.user.id),
        reelproducttag: {
          create: productTags,
        },
      },
      include: REEL_INCLUDE(Number(req.user.id)),
    });

    return res.status(201).json(buildReelResponse(createdReel, req));
  } catch (error) {
    await deleteManagedImageFiles(uploadedPaths);
    return res.status(500).json({
      message: "Failed to create reel",
      error: error.message,
    });
  }
}

export async function updateReel(req, res) {
  const uploadedVideoPaths = getUploadedReelPaths(getUploadedFiles(req, "video"));
  const uploadedThumbnailPaths = getUploadedReelPaths(
    getUploadedFiles(req, "thumbnail"),
  );
  const uploadedPaths = [...uploadedVideoPaths, ...uploadedThumbnailPaths];

  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      await deleteManagedImageFiles(uploadedPaths);
      return res.status(400).json({ message: "Invalid reel id" });
    }

    const existingReel = await prisma.reel.findUnique({
      where: { id },
      include: {
        reelproducttag: true,
      },
    });

    if (!existingReel) {
      await deleteManagedImageFiles(uploadedPaths);
      return res.status(404).json({ message: "Reel not found" });
    }

    const title = String(req.body.title ?? existingReel.title).trim();
    const caption =
      req.body.caption === undefined
        ? existingReel.caption
        : String(req.body.caption ?? "").trim() || null;
    const nextVideoUrl =
      uploadedVideoPaths[0] ??
      toStoredImagePath(req.body.videoUrl, req) ??
      existingReel.videoUrl;
    const requestedThumbnailUrl = toStoredImagePath(req.body.thumbnailUrl, req);
    const hasNewThumbnailInput = Boolean(
      uploadedThumbnailPaths[0] ||
        (requestedThumbnailUrl &&
          requestedThumbnailUrl !== existingReel.thumbnailUrl),
    );
    let nextThumbnailUrl =
      uploadedThumbnailPaths[0] ?? requestedThumbnailUrl ?? existingReel.thumbnailUrl;
    const shouldReplaceTags = Object.prototype.hasOwnProperty.call(
      req.body,
      "productTags",
    );
    const productTags = normalizeProductTags(req.body.productTags);

    if (!title || !nextVideoUrl) {
      await deleteManagedImageFiles(uploadedPaths);
      return res.status(400).json({ message: "Title and video are required" });
    }

    if (!uploadedVideoPaths[0]) {
      logAutoThumbnailSkipped("updateReel", "video was not changed", {
        reelId: id,
        videoUrl: nextVideoUrl,
      });
    } else if (hasNewThumbnailInput) {
      logAutoThumbnailSkipped("updateReel", "thumbnail already provided", {
        reelId: id,
        videoUrl: nextVideoUrl,
        thumbnailUrl: uploadedThumbnailPaths[0] ?? requestedThumbnailUrl,
      });
    } else {
      const generatedThumbnailUrl = await tryGenerateReelThumbnail(
        nextVideoUrl,
        "updateReel",
      );

      if (generatedThumbnailUrl) {
        nextThumbnailUrl = generatedThumbnailUrl;
        uploadedPaths.push(generatedThumbnailUrl);
      } else {
        nextThumbnailUrl = existingReel.thumbnailUrl;
      }
    }

    const updatedReel = await prisma.$transaction(async (tx) => {
      if (shouldReplaceTags) {
        await tx.reelproducttag.deleteMany({ where: { reelId: id } });
      }

      await tx.reel.update({
        where: { id },
        data: {
          title,
          caption,
          videoUrl: nextVideoUrl,
          thumbnailUrl: nextThumbnailUrl,
          duration:
            req.body.duration === undefined
              ? existingReel.duration
              : parseOptionalInteger(req.body.duration),
          status:
            req.body.status === undefined
              ? existingReel.status
              : normalizeReelStatus(req.body.status),
          featured:
            req.body.featured === undefined
              ? existingReel.featured
              : parseBoolean(req.body.featured),
          sortOrder:
            req.body.sortOrder === undefined
              ? existingReel.sortOrder
              : Number(req.body.sortOrder ?? 0) || 0,
          ...(shouldReplaceTags
            ? {
              reelproducttag: {
                create: productTags,
              },
            }
            : {}),
        },
      });

      return tx.reel.findUnique({
        where: { id },
        include: REEL_INCLUDE(Number(req.user.id)),
      });
    });

    const filesToDelete = [];
    if (uploadedVideoPaths[0] && existingReel.videoUrl !== nextVideoUrl) {
      filesToDelete.push(existingReel.videoUrl);
    }
    if (
      (uploadedThumbnailPaths[0] || nextThumbnailUrl !== existingReel.thumbnailUrl) &&
      existingReel.thumbnailUrl &&
      existingReel.thumbnailUrl !== nextThumbnailUrl
    ) {
      filesToDelete.push(existingReel.thumbnailUrl);
    }
    await deleteManagedImageFiles(filesToDelete);

    return res.json(buildReelResponse(updatedReel, req));
  } catch (error) {
    await deleteManagedImageFiles(uploadedPaths);
    return res.status(500).json({
      message: "Failed to update reel",
      error: error.message,
    });
  }
}

export async function deleteReel(req, res) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid reel id" });
    }

    const existingReel = await prisma.reel.findUnique({
      where: { id },
      select: {
        videoUrl: true,
        thumbnailUrl: true,
      },
    });

    if (!existingReel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    await prisma.reel.delete({ where: { id } });
    await deleteManagedImageFiles([
      existingReel.videoUrl,
      existingReel.thumbnailUrl,
    ]);

    return res.json({ message: "Reel deleted" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete reel",
      error: error.message,
    });
  }
}
