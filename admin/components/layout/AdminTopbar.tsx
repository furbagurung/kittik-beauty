"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function AdminTopbar() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");

    if (storedUser) {
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch {
        setAdminUser(null);
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold">Admin Panel</h1>
        {adminUser ? (
          <p className="text-sm text-gray-500">Logged in as {adminUser.name}</p>
        ) : null}
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Logout
      </button>
    </header>
  );
}
