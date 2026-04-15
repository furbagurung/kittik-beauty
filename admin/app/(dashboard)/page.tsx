"use client";

import PageHeader from "@/components/shared/PageHeader";
import SectionCard from "@/components/shared/SectionCard";
import {
  getAdminStats,
  getRecentOrders,
  type AdminDashboardStats,
  type AdminRecentOrder,
} from "@/lib/api";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [recentOrders, setRecentOrders] = useState<AdminRecentOrder[]>([]);
  useEffect(() => {
    async function loadStats() {
      try {
        const [statsData, recentOrdersData] = await Promise.all([
          getAdminStats(),
          getRecentOrders(),
        ]);

        setStats(statsData);
        setRecentOrders(recentOrdersData);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard stats.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome to the Kittik Beauty admin panel."
      />

      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SectionCard title="Total Users">
          <p className="text-3xl font-semibold text-gray-900">
            {loading ? "..." : (stats?.totalUsers ?? 0)}
          </p>
        </SectionCard>

        <SectionCard title="Total Products">
          <p className="text-3xl font-semibold text-gray-900">
            {loading ? "..." : (stats?.totalProducts ?? 0)}
          </p>
        </SectionCard>

        <SectionCard title="Total Orders">
          <p className="text-3xl font-semibold text-gray-900">
            {loading ? "..." : (stats?.totalOrders ?? 0)}
          </p>
        </SectionCard>
      </div>
      <div className="mt-6">
        <SectionCard title="Recent Orders">
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-gray-500"
                    >
                      Loading recent orders...
                    </td>
                  </tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t transition hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-700">{order.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {order.fullName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        NPR {order.total}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {order.status}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-gray-500"
                    >
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
