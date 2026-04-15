"use client";

import PageHeader from "@/components/shared/PageHeader";
import { getUsers, type AdminApiUser } from "@/lib/api";
import { useEffect, useState } from "react";

export default function CustomersPage() {
  const [users, setUsers] = useState<AdminApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load users.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <div>
      <PageHeader
        title="Customers"
        description="View all users and their roles."
      />

      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">User ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  Loading users...
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t transition hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-700">{user.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{user.email}</td>
                  <td className="px-4 py-3 text-gray-700">{user.role}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
