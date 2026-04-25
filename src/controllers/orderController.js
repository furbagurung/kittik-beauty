import { prisma } from "../config/prisma.js";
import {
  buildPaginationMeta,
  getPaginationParams,
} from "../utils/apiPagination.js";
import { restoreOrderStock } from "../utils/inventory.js";
import {
  canAdminCancelOrder,
  canCustomerCancelOrder,
  shouldRestoreStockOnCancellation,
} from "../utils/orderRules.js";
import { timeQuery } from "../utils/queryTiming.js";

function buildOrderResponse(order) {
  if (!order) return order;

  return {
    ...order,
    items: order.orderitem ?? [],
  };
}

export async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const {
      items,
      fullName,
      phone,
      address,
      paymentMethod,
      subtotal,
      deliveryFee,
      total,
      totalItems,
      status,
    } = req.body;

    if (!items?.length) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!fullName || !phone || !address || !paymentMethod) {
      return res.status(400).json({ message: "Missing checkout information" });
    }

    const normalizedItems = items.map((item) => ({
      productId:
        item.productId === undefined && item.id === undefined
          ? undefined
          : Number(item.productId ?? item.id),
      variantId:
        item.variantId === undefined ? undefined : Number(item.variantId),
      name: String(item.name),
      price: Number(item.price),
      quantity: Number(item.quantity),
    }));

    for (const item of normalizedItems) {
      if (
        (!Number.isInteger(item.variantId) &&
          !Number.isInteger(item.productId)) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({ message: "Invalid order item data" });
      }
    }

    const variantIds = normalizedItems
      .map((item) => item.variantId)
      .filter((id) => Number.isInteger(id));
    const productIds = normalizedItems
      .filter((item) => !Number.isInteger(item.variantId))
      .map((item) => item.productId);

    const [requestedVariants, fallbackProducts] = await Promise.all([
      prisma.productVariant.findMany({
        where: {
          id: { in: variantIds },
        },
        include: { product: true },
      }),
      prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        include: {
          variants: {
            where: { isDefault: true },
            take: 1,
          },
        },
      }),
    ]);

    const variantMap = new Map(
      requestedVariants.map((variant) => [variant.id, variant]),
    );
    const fallbackProductMap = new Map(
      fallbackProducts.map((product) => [product.id, product]),
    );
    const orderItems = normalizedItems.map((item) => {
      if (Number.isInteger(item.variantId)) {
        const variant = variantMap.get(item.variantId);

        return { ...item, variant };
      }

      const product = fallbackProductMap.get(item.productId);
      const variant = product?.variants?.[0];

      return { ...item, variant, product };
    });

    for (const item of orderItems) {
      const variant = item.variant;

      if (!variant) {
        return res.status(404).json({
          message: `Product variant not found: ${
            item.variantId ?? item.productId
          }`,
        });
      }

      if (
        variant.trackQuantity &&
        !variant.continueSellingWhenOutOfStock &&
        variant.stock < item.quantity
      ) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}. Only ${variant.stock} left.`,
        });
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      for (const item of orderItems) {
        if (
          !item.variant.trackQuantity ||
          item.variant.continueSellingWhenOutOfStock
        ) {
          continue;
        }

        const updateResult = await tx.productVariant.updateMany({
          where: {
            id: item.variant.id,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count === 0) {
          const latestVariant = await tx.productVariant.findUnique({
            where: { id: item.variant.id },
          });

          return res.status(400).json({
            message: `Insufficient stock for ${
              item.name || latestVariant?.title || "this product"
            }. Only ${latestVariant?.stock ?? 0} left.`,
          });
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          userId,
          fullName,
          phone,
          address,
          paymentMethod,
          subtotal: Number(subtotal),
          deliveryFee: Number(deliveryFee),
          total: Number(total),
          totalItems: Number(totalItems),
          status:
            status || (paymentMethod === "cod" ? "placed" : "pending_payment"),
          orderitem: {
            create: orderItems.map((item) => ({
              variantId: item.variant.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          orderitem: true,
        },
      });

      return createdOrder;
    });

    if (!order || order.headersSent) {
      return;
    }

    return res.status(201).json(buildOrderResponse(order));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
}
export async function getUserOrders(req, res) {
  try {
    const pagination = getPaginationParams(req.query);
    const { page, limit, isPaginated } = pagination;
    console.log("Pagination:", { page, limit, isPaginated });
    const queryContext = {
      route: "GET /api/orders",
      page: isPaginated ? page : undefined,
      limit: isPaginated ? limit : undefined,
    };
    const currentUser = await timeQuery(
      "orders.currentUser",
      () =>
        prisma.user.findUnique({
          where: { id: req.user.id },
        }),
      queryContext,
    );
    const where = currentUser?.role === "admin" ? {} : { userId: req.user.id };

    const [total, orders] = isPaginated
      ? await Promise.all([
          timeQuery(
            "orders.count",
            () => prisma.order.count({ where }),
            queryContext,
          ),
          timeQuery(
            "orders.findMany",
            () =>
              prisma.order.findMany({
                where,
                include: { orderitem: true },
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
            "orders.findMany",
            () =>
              prisma.order.findMany({
                where,
                include: { orderitem: true },
                orderBy: { createdAt: "desc" },
              }),
            queryContext,
          ),
        ];

    const response = orders.map((order) => buildOrderResponse(order));

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
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
}
export async function getOrderById(req, res) {
  try {
    const orderId = Number(req.params.id);

    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const order = await prisma.order.findFirst({
      where:
        currentUser?.role === "admin"
          ? { id: orderId }
          : {
              id: orderId,
              userId: req.user.id,
            },
      include: { orderitem: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(buildOrderResponse(order));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
}

export async function cancelOwnOrder(req, res) {
  try {
    const orderId = Number(req.params.id);

    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id,
      },
      include: { orderitem: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!canCustomerCancelOrder(existingOrder)) {
      return res.status(400).json({
        message: `You cannot cancel an order with status "${existingOrder.status}"`,
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "cancelled" },
        include: { orderitem: true },
      });

      if (shouldRestoreStockOnCancellation(existingOrder, "cancelled")) {
        await restoreOrderStock(orderId, "cancelled", tx);
      }

      return updatedOrder;
    });

    return res.json(buildOrderResponse(order));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderitem: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (existingOrder.status === status) {
      return res.json(buildOrderResponse(existingOrder));
    }

    if (status === "cancelled" && !canAdminCancelOrder(existingOrder)) {
      return res.status(400).json({
        message: `Admin cannot cancel an order with status "${existingOrder.status}"`,
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: { orderitem: true },
      });

      if (shouldRestoreStockOnCancellation(existingOrder, status)) {
        await restoreOrderStock(orderId, status, tx);
      }

      return updatedOrder;
    });

    return res.json(buildOrderResponse(order));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
}
