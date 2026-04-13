import { prisma } from "../config/prisma.js";

const VALID_ORDER_STATUSES = [
  "pending_payment",
  "placed",
  "paid",
  "processing",
  "delivered",
];

export async function getAdminOrders(req, res) {
  try {
    const { search, status } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        ...(status ? { status: String(status) } : {}),
        ...(search
          ? {
              OR: [
                {
                  fullName: {
                    contains: String(search),
                  },
                },
                {
                  phone: {
                    contains: String(search),
                  },
                },
                {
                  user: {
                    name: {
                      contains: String(search),
                    },
                  },
                },
                {
                  user: {
                    email: {
                      contains: String(search),
                    },
                  },
                },
                {
                  items: {
                    some: {
                      name: {
                        contains: String(search),
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load admin orders",
      error: error.message,
    });
  }
}

export async function updateAdminOrderStatus(req, res) {
  try {
    const orderId = Number(req.params.id);
    const status = String(req.body.status ?? "").trim();

    if (Number.isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    if (!VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Status must be one of the supported order states",
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
    });

    return res.json(order);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
}
