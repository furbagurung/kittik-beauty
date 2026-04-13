import { prisma } from "../config/prisma.js";

const ORDER_STATUS_FLOW = [
  "pending_payment",
  "placed",
  "paid",
  "processing",
  "delivered",
];

export async function getAdminDashboard(req, res) {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      orderTotals,
      pendingPayments,
      recentOrders,
      groupedStatuses,
    ] = await prisma.$transaction([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
      prisma.order.count({
        where: {
          status: "pending_payment",
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          items: true,
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    const totalRevenue = orderTotals._sum.total ?? 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const groupedStatusMap = new Map(
      groupedStatuses.map((entry) => [entry.status, entry]),
    );

    return res.json({
      metrics: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalRevenue,
        pendingPayments,
        averageOrderValue,
      },
      statusBreakdown: ORDER_STATUS_FLOW.map((status) => {
        const entry = groupedStatusMap.get(status);

        return {
          status,
          count: entry?._count._all ?? 0,
          total: entry?._sum.total ?? 0,
        };
      }),
      recentOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load admin dashboard",
      error: error.message,
    });
  }
}
