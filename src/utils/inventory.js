import { prisma } from "../config/prisma.js";

const RESTOCKABLE_STATUSES = new Set(["cancelled", "payment_failed"]);

export async function restoreOrderStock(orderId, nextStatus, tx = prisma) {
  if (!RESTOCKABLE_STATUSES.has(nextStatus)) {
    return { restored: false, reason: "status_not_restockable" };
  }

  const order = await tx.order.findUnique({
    where: { id: Number(orderId) },
    include: { items: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.stockRestored) {
    return { restored: false, reason: "already_restored" };
  }

  for (const item of order.items) {
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    });
  }

  await tx.order.update({
    where: { id: Number(orderId) },
    data: { stockRestored: true },
  });

  return { restored: true };
}
