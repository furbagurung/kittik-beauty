"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Orders", href: "/orders" },
  { label: "Customers", href: "/customers" },
  { label: "Settings", href: "/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white p-4">
      <div className="mb-6 text-xl font-bold">Kittik Admin</div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
