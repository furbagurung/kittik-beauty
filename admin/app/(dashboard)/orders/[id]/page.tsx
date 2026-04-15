"use client";

import PageHeader from "@/components/shared/PageHeader";
import { getOrderById, updateOrderStatus, type AdminApiOrder } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [order, setOrder] = useState<AdminApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await getOrderById(id);
        setOrder(data);
        setSelectedStatus(data.status);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load order.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);
  async function handleSaveStatus() {
    if (!order) return;

    try {
      setSavingStatus(true);

      const updatedOrder = await updateOrderStatus(order.id, selectedStatus);
      setOrder(updatedOrder);
      setSelectedStatus(updatedOrder.status);

      alert("Order status updated successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update order status.";

      alert(message);
    } finally {
      setSavingStatus(false);
    }
  }
  return (
    <div>
      <PageHeader title="Order Detail" description={`Order ID: ${id}`} />

      {loading ? (
        <div className="rounded-xl border bg-white p-6 text-sm text-gray-500">
          Loading order...
        </div>
      ) : errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : order ? (
        <div className="rounded-xl border bg-white p-6">
          <div className="grid gap-4 text-sm text-gray-700">
            <div>
              <span className="font-medium text-gray-900">Customer:</span>{" "}
              {order.fullName}
            </div>
            <div>
              <span className="font-medium text-gray-900">Phone:</span>{" "}
              {order.phone}
            </div>
            <div>
              <span className="font-medium text-gray-900">Address:</span>{" "}
              {order.address}
            </div>
            <div>
              <span className="font-medium text-gray-900">Payment Method:</span>{" "}
              {order.paymentMethod}
            </div>
            <div>
              <span className="font-medium text-gray-900">Total Items:</span>{" "}
              {order.totalItems}
            </div>
            <div>
              <span className="font-medium text-gray-900">Subtotal:</span>{" "}
              {formatCurrency(order.subtotal)}
            </div>
            <div>
              <span className="font-medium text-gray-900">Delivery Fee:</span>{" "}
              {formatCurrency(order.deliveryFee)}
            </div>
            <div>
              <span className="font-medium text-gray-900">Total:</span>{" "}
              {formatCurrency(order.total)}
            </div>
            <div className="grid gap-2">
              <label className="font-medium text-gray-900">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
              >
                <option value="pending_payment">pending_payment</option>
                <option value="placed">placed</option>
                <option value="processing">processing</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={savingStatus}
                className="mt-3 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {savingStatus ? "Saving..." : "Save Status"}
              </button>
            </div>
            <div>
              <span className="font-medium text-gray-900">Created At:</span>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-3 text-base font-semibold text-gray-900">
              Order Items
            </h2>

            {order.items && order.items.length > 0 ? (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Quantity</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3 text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No order items found.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-white p-6 text-sm text-gray-500">
          Order not found.
        </div>
      )}
    </div>
  );
}
