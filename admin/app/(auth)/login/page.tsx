"use client";

import { adminLogin } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await adminLogin({
        email,
        password,
      });

      localStorage.setItem("adminToken", response.token);
      localStorage.setItem("adminUser", JSON.stringify(response.user));

      router.push("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Admin login failed.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to access the Kittik Beauty admin panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
