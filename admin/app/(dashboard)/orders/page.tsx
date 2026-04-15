"use client";

import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import PageHeader from "@/components/shared/PageHeader";
import { getOrders, type AdminApiOrder } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load orders.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Track customer orders and payment status."
      />

      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  Loading orders...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t transition hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-700">{order.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {order.fullName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {order.paymentMethod}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium text-black underline-offset-4 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No orders available right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
