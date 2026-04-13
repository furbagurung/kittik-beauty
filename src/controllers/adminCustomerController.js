import { prisma } from "../config/prisma.js";
import { getUserRole } from "../utils/adminHelpers.js";

export async function getAdminCustomers(req, res) {
  try {
    const { search } = req.query;

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              {
                name: {
                  contains: String(search),
                },
              },
              {
                email: {
                  contains: String(search),
                },
              },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          select: {
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(
      users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: getUserRole(user.email),
        createdAt: user.createdAt,
        orderCount: user._count.orders,
        totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
        lastOrderAt: user.orders[0]?.createdAt ?? null,
      })),
    );
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load admin customers",
      error: error.message,
    });
  }
}
