import { prisma } from "../config/prisma.js";
import { restoreOrderStock } from "../utils/inventory.js";
import {
  canAdminCancelOrder,
  canCustomerCancelOrder,
  shouldRestoreStockOnCancellation,
} from "../utils/orderRules.js";
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
      productId: Number(item.productId ?? item.id),
      name: String(item.name),
      price: Number(item.price),
      quantity: Number(item.quantity),
    }));

    for (const item of normalizedItems) {
      if (
        !Number.isInteger(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({ message: "Invalid order item data" });
      }
    }

    const productIds = normalizedItems.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    for (const item of normalizedItems) {
      const product = productMap.get(item.productId);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
        });
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      for (const item of normalizedItems) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
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
          const latestProduct = await tx.product.findUnique({
            where: { id: item.productId },
          });

          return res.status(400).json({
            message: `Insufficient stock for ${
              latestProduct?.name || "this product"
            }. Only ${latestProduct?.stock ?? 0} left.`,
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
          items: {
            create: normalizedItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return createdOrder;
    });

    if (!order || order.headersSent) {
      return;
    }

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
}
export async function getUserOrders(req, res) {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const orders = await prisma.order.findMany({
      where: currentUser?.role === "admin" ? {} : { userId: req.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json(orders);
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
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
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
      include: { items: true },
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
        include: { items: true },
      });

      if (shouldRestoreStockOnCancellation(existingOrder, "cancelled")) {
        await restoreOrderStock(orderId, "cancelled", tx);
      }

      return updatedOrder;
    });

    return res.json(order);
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
      include: { items: true },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (existingOrder.status === status) {
      return res.json(existingOrder);
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
        include: { items: true },
      });

      if (shouldRestoreStockOnCancellation(existingOrder, status)) {
        await restoreOrderStock(orderId, status, tx);
      }

      return updatedOrder;
    });

    return res.json(order);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
}
