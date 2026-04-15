"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      setIsAllowed(true);
    } else {
      setIsAllowed(false);
    }

    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && isAllowed === false) {
      router.push("/login");
    }
  }, [isReady, isAllowed, router]);

  if (!isReady || isAllowed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Checking access...
      </div>
    );
  }

  if (!isAllowed) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminTopbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
