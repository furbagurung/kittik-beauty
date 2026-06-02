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

const ORDER_LIST_INCLUDE = {
  orderitem: {
    select: {
      id: true,
      orderId: true,
      variantId: true,
      name: true,
      price: true,
      quantity: true,
    },
  },
};

function buildOrderResponse(order) {
  if (!order) return order;

  return {
    ...order,
    items: order.orderitem ?? [],
  };
}

function toTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toNullableTrimmedString(value) {
  const trimmed = toTrimmedString(value);
  return trimmed || null;
}

function composeAddress({
  addressLine1,
  addressLine2,
  city,
  area,
  landmark,
  province,
}) {
  const primary = [
    addressLine1,
    addressLine2,
    area,
    city,
    province,
  ].filter(Boolean);
  const address = primary.join(", ");

  return landmark ? `${address} (Landmark: ${landmark})` : address;
}

function buildManualAddressPayload(body) {
  const addressLine1 = toTrimmedString(body.addressLine1);
  const city = toTrimmedString(body.city);

  if (!addressLine1 || !city) {
    return null;
  }

  return {
    fullName: toTrimmedString(body.fullName),
    phone: toTrimmedString(body.phone),
    addressLine1,
    addressLine2: toNullableTrimmedString(body.addressLine2),
    city,
    area: toNullableTrimmedString(body.area),
    landmark: toNullableTrimmedString(body.landmark),
    province: toNullableTrimmedString(body.province),
  };
}

async function resolveCheckoutAddress(req) {
  const { savedAddressId } = req.body;

  if (savedAddressId !== undefined && savedAddressId !== null && savedAddressId !== "") {
    if (!req.customer) {
      return {
        errorStatus: 401,
        message: "Customer login required to use a saved address",
      };
    }

    const addressId = Number(savedAddressId);

    if (!Number.isInteger(addressId)) {
      return { errorStatus: 400, message: "Invalid saved address" };
    }

    const savedAddress = await prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        customerId: req.customer.id,
      },
    });

    if (!savedAddress) {
      return { errorStatus: 404, message: "Saved address not found" };
    }

    return {
      fullName: savedAddress.fullName,
      phone: savedAddress.phone,
      address: composeAddress(savedAddress),
      selectedAddress: savedAddress,
      manualAddressPayload: null,
    };
  }

  const fullName = toTrimmedString(req.body.fullName || req.customer?.fullName);
  const phone = toTrimmedString(req.body.phone || req.customer?.phone);
  const manualAddressPayload = buildManualAddressPayload({
    ...req.body,
    fullName,
    phone,
  });
  const address =
    toTrimmedString(req.body.address) ||
    (manualAddressPayload ? composeAddress(manualAddressPayload) : "");

  if (!fullName || !phone || !address) {
    return { errorStatus: 400, message: "Missing checkout information" };
  }

  if (req.body.saveAddress === true && req.customer && !manualAddressPayload) {
    return {
      errorStatus: 400,
      message: "Structured address fields are required to save this address",
    };
  }

  return {
    fullName,
    phone,
    address,
    selectedAddress: null,
    manualAddressPayload,
  };
}

export async function createOrder(req, res) {
  try {
    const userId = req.user?.id === undefined ? null : Number(req.user.id);
    const tokenCustomerId = req.customer?.id ?? null;
    const {
      items,
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

    if (!paymentMethod) {
      return res.status(400).json({ message: "Missing checkout information" });
    }

    const checkoutAddress = await resolveCheckoutAddress(req);

    if (checkoutAddress.errorStatus) {
      return res
        .status(checkoutAddress.errorStatus)
        .json({ message: checkoutAddress.message });
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

    const currentUser = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        })
      : null;
    const linkedCustomer =
      !tokenCustomerId && currentUser?.email
        ? await prisma.customer.findUnique({
            where: { email: currentUser.email },
            select: { id: true },
          })
        : null;
    const orderCustomerId = tokenCustomerId ?? linkedCustomer?.id ?? null;

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
          customerId: orderCustomerId,
          fullName: checkoutAddress.fullName,
          phone: checkoutAddress.phone,
          address: checkoutAddress.address,
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

      if (
        orderCustomerId &&
        req.body.saveAddress === true &&
        !checkoutAddress.selectedAddress &&
        checkoutAddress.manualAddressPayload
      ) {
        const shouldSetDefault =
          req.body.isDefault === true ||
          (await tx.customerAddress.count({
            where: { customerId: orderCustomerId },
          })) === 0;

        if (shouldSetDefault) {
          await tx.customerAddress.updateMany({
            where: { customerId: orderCustomerId },
            data: { isDefault: false },
          });
        }

        await tx.customerAddress.create({
          data: {
            ...checkoutAddress.manualAddressPayload,
            customerId: orderCustomerId,
            isDefault: shouldSetDefault,
          },
        });
      }

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
                include: ORDER_LIST_INCLUDE,
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
