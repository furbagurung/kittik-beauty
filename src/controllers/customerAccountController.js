import { prisma } from "../config/prisma.js";
import { buildProductResponse } from "../utils/productImageUtils.js";

const RECENTLY_VIEWED_LIMIT = 12;

const ACCOUNT_PRODUCT_INCLUDE = {
  category: true,
  subCategory: {
    include: {
      category: true,
    },
  },
  brand: true,
  productmedia: true,
  producttag: true,
  options: {
    include: {
      values: true,
    },
  },
  variants: {
    include: {
      selections: {
        include: {
          option: true,
          optionValue: true,
        },
      },
    },
  },
};

const ORDER_ITEM_SELECT = {
  id: true,
  variantId: true,
  name: true,
  price: true,
  quantity: true,
};

function derivePaymentStatus(order) {
  if (order.status === "paid") return "paid";
  if (order.status === "payment_failed") return "failed";
  if (order.status === "pending_payment") return "pending";
  if (order.paymentMethod === "cod") return "cash_on_delivery";
  return "unknown";
}

function serializeCustomerOrder(order, includeItems = false) {
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    paymentStatus: derivePaymentStatus(order),
    paymentMethod: order.paymentMethod,
    total: order.total,
    totalItems: order.totalItems,
    ...(includeItems
      ? {
          fullName: order.fullName,
          phone: order.phone,
          address: order.address,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          items: order.orderitem ?? [],
        }
      : {}),
  };
}

function serializeCustomerAddress(address) {
  return {
    id: address.id,
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    area: address.area,
    landmark: address.landmark,
    province: address.province,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

function readOptionalString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readRequiredString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildAddressCreateData(customerId, body) {
  return {
    customerId,
    fullName: readRequiredString(body.fullName),
    phone: readRequiredString(body.phone),
    addressLine1: readRequiredString(body.addressLine1),
    addressLine2: readOptionalString(body.addressLine2),
    city: readRequiredString(body.city),
    area: readOptionalString(body.area),
    landmark: readOptionalString(body.landmark),
    province: readOptionalString(body.province),
    isDefault: Boolean(body.isDefault),
  };
}

function buildAddressUpdateData(body) {
  const data = {};

  for (const field of ["fullName", "phone", "addressLine1", "city"]) {
    if (field in body) {
      data[field] = readRequiredString(body[field]);
    }
  }

  for (const field of ["addressLine2", "area", "landmark", "province"]) {
    if (field in body) {
      data[field] = readOptionalString(body[field]);
    }
  }

  if ("isDefault" in body) {
    data.isDefault = Boolean(body.isDefault);
  }

  return data;
}

function hasRequiredAddressFields(address) {
  return Boolean(address.fullName && address.phone && address.addressLine1 && address.city);
}

function parseCustomerResourceId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getExistingProduct(productId) {
  return prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
}

function serializeProductItems(items, req, productKey = "product") {
  return items
    .map((item) => item[productKey])
    .filter(Boolean)
    .map((product) => buildProductResponse(product, req));
}

export async function getCustomerOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.customer.id },
      select: {
        id: true,
        createdAt: true,
        status: true,
        paymentMethod: true,
        total: true,
        totalItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ orders: orders.map((order) => serializeCustomerOrder(order)) });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch customer orders",
      error: error.message,
    });
  }
}

export async function getCustomerOrderById(req, res) {
  try {
    const orderId = parseCustomerResourceId(req.params.id);

    if (!orderId) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: req.customer.id,
      },
      include: {
        orderitem: {
          select: ORDER_ITEM_SELECT,
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ order: serializeCustomerOrder(order, true) });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch customer order",
      error: error.message,
    });
  }
}

export async function getCustomerAddresses(req, res) {
  try {
    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: req.customer.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return res.json({ addresses: addresses.map(serializeCustomerAddress) });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch customer addresses",
      error: error.message,
    });
  }
}

export async function createCustomerAddress(req, res) {
  try {
    const data = buildAddressCreateData(req.customer.id, req.body);

    if (!hasRequiredAddressFields(data)) {
      return res.status(400).json({ message: "Full name, phone, address line 1, and city are required" });
    }

    const existingAddressCount = await prisma.customerAddress.count({
      where: { customerId: req.customer.id },
    });
    data.isDefault = data.isDefault || existingAddressCount === 0;

    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId: req.customer.id },
          data: { isDefault: false },
        });
      }

      return tx.customerAddress.create({ data });
    });

    return res.status(201).json({
      message: "Address added",
      address: serializeCustomerAddress(address),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add customer address",
      error: error.message,
    });
  }
}

export async function updateCustomerAddress(req, res) {
  try {
    const addressId = parseCustomerResourceId(req.params.id);

    if (!addressId) {
      return res.status(400).json({ message: "Invalid address id" });
    }

    const existingAddress = await prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        customerId: req.customer.id,
      },
    });

    if (!existingAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    const data = buildAddressUpdateData(req.body);
    const nextAddress = { ...existingAddress, ...data };

    if (!hasRequiredAddressFields(nextAddress)) {
      return res.status(400).json({ message: "Full name, phone, address line 1, and city are required" });
    }

    const address = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.customerAddress.updateMany({
          where: {
            customerId: req.customer.id,
            id: { not: addressId },
          },
          data: { isDefault: false },
        });
      }

      return tx.customerAddress.update({
        where: { id: addressId },
        data,
      });
    });

    return res.json({
      message: "Address updated",
      address: serializeCustomerAddress(address),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update customer address",
      error: error.message,
    });
  }
}

export async function deleteCustomerAddress(req, res) {
  try {
    const addressId = parseCustomerResourceId(req.params.id);

    if (!addressId) {
      return res.status(400).json({ message: "Invalid address id" });
    }

    const existingAddress = await prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        customerId: req.customer.id,
      },
    });

    if (!existingAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    await prisma.customerAddress.delete({ where: { id: addressId } });

    return res.json({ message: "Address deleted" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete customer address",
      error: error.message,
    });
  }
}

export async function setDefaultCustomerAddress(req, res) {
  try {
    const addressId = parseCustomerResourceId(req.params.id);

    if (!addressId) {
      return res.status(400).json({ message: "Invalid address id" });
    }

    const existingAddress = await prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        customerId: req.customer.id,
      },
    });

    if (!existingAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    const address = await prisma.$transaction(async (tx) => {
      await tx.customerAddress.updateMany({
        where: { customerId: req.customer.id },
        data: { isDefault: false },
      });

      return tx.customerAddress.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });

    return res.json({
      message: "Default address updated",
      address: serializeCustomerAddress(address),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update default address",
      error: error.message,
    });
  }
}

export async function getCustomerWishlist(req, res) {
  try {
    const items = await prisma.customerWishlist.findMany({
      where: { customerId: req.customer.id },
      include: {
        product: {
          include: ACCOUNT_PRODUCT_INCLUDE,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ products: serializeProductItems(items, req) });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch customer wishlist",
      error: error.message,
    });
  }
}

export async function addCustomerWishlistItem(req, res) {
  try {
    const productId = parseCustomerResourceId(req.body.productId);

    if (!productId) {
      return res.status(400).json({ message: "Valid product id is required" });
    }

    const product = await getExistingProduct(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.customerWishlist.upsert({
      where: {
        customerId_productId: {
          customerId: req.customer.id,
          productId,
        },
      },
      update: {},
      create: {
        customerId: req.customer.id,
        productId,
      },
    });

    return res.status(201).json({ message: "Product added to wishlist", productId });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add wishlist item",
      error: error.message,
    });
  }
}

export async function deleteCustomerWishlistItem(req, res) {
  try {
    const productId = parseCustomerResourceId(req.params.productId);

    if (!productId) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    await prisma.customerWishlist.deleteMany({
      where: {
        customerId: req.customer.id,
        productId,
      },
    });

    return res.json({ message: "Product removed from wishlist", productId });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove wishlist item",
      error: error.message,
    });
  }
}

export async function getCustomerRecentlyViewed(req, res) {
  try {
    const items = await prisma.customerRecentlyViewed.findMany({
      where: { customerId: req.customer.id },
      include: {
        product: {
          include: ACCOUNT_PRODUCT_INCLUDE,
        },
      },
      orderBy: { viewedAt: "desc" },
      take: RECENTLY_VIEWED_LIMIT,
    });

    return res.json({ products: serializeProductItems(items, req) });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch recently viewed products",
      error: error.message,
    });
  }
}

export async function trackCustomerRecentlyViewed(req, res) {
  try {
    const productId = parseCustomerResourceId(req.body.productId);

    if (!productId) {
      return res.status(400).json({ message: "Valid product id is required" });
    }

    const product = await getExistingProduct(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.customerRecentlyViewed.upsert({
      where: {
        customerId_productId: {
          customerId: req.customer.id,
          productId,
        },
      },
      update: { viewedAt: new Date() },
      create: {
        customerId: req.customer.id,
        productId,
      },
    });

    const staleItems = await prisma.customerRecentlyViewed.findMany({
      where: { customerId: req.customer.id },
      orderBy: { viewedAt: "desc" },
      skip: RECENTLY_VIEWED_LIMIT,
      select: { id: true },
    });

    if (staleItems.length) {
      await prisma.customerRecentlyViewed.deleteMany({
        where: {
          id: { in: staleItems.map((item) => item.id) },
          customerId: req.customer.id,
        },
      });
    }

    return res.status(201).json({ message: "Recently viewed product tracked", productId });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to track recently viewed product",
      error: error.message,
    });
  }
}
