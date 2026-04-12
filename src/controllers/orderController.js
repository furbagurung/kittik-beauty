import { prisma } from "../config/prisma.js";

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

    const order = await prisma.order.create({
      data: {
        userId,
        fullName,
        phone,
        address,
        paymentMethod,
        subtotal,
        deliveryFee,
        total,
        totalItems,
        status:
          status || (paymentMethod === "cod" ? "placed" : "pending_payment"),
        items: {
          create: items.map((item) => ({
            productId: Number(item.productId ?? item.id),
            name: String(item.name),
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        },
      },
      include: {
        items: true,
      },
    });

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
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
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

    const order = await prisma.order.findFirst({
      where: {
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
export async function updateOrderStatus(req, res) {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    return res.json(order);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
}
