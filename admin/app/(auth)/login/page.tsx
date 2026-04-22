"use client";

import Kbd from "@/components/shared/Kbd";
import Notice from "@/components/shared/Notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bootstrapAdminSession, setAdminSession } from "@/lib/admin-session";
import { adminLogin } from "@/lib/api";
import { useAdminSession } from "@/lib/use-admin-session";
import { ArrowRight, ShieldCheck, Store, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { status } = useAdminSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    void bootstrapAdminSession();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Enter an email and password to continue.");
      return;
    }

    try {
      setLoading(true);
      const response = await adminLogin({ email, password });
      setAdminSession({
        token: response.token,
        user: response.user,
      });
      router.replace("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Admin login failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-background text-foreground lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="hidden border-r border-hairline bg-secondary/55 lg:block">
        <div className="flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground shadow-[0_1px_0_0_var(--primary-strong)]">
              K
            </span>
            <div>
              <div className="text-base font-semibold text-foreground">Kittik</div>
              <div className="text-sm text-muted-foreground">Admin console</div>
            </div>
          </div>

          <div className="max-w-xl">
            <div className="text-[2.5rem] font-semibold tracking-[-0.04em] text-foreground">
              Run orders, catalog, and customer operations from one workspace.
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              A practical backend surface for managing the beauty storefront with a Shopify-style operations flow.
            </p>

            <div className="mt-8 grid gap-3">
              <FeatureLine
                icon={<Store className="size-4" strokeWidth={2} />}
                label="Catalog management"
                value="products"
              />
              <FeatureLine
                icon={<Zap className="size-4" strokeWidth={2} />}
                label="Fast command search"
                value="cmd+k"
              />
              <FeatureLine
                icon={<ShieldCheck className="size-4" strokeWidth={2} />}
                label="Role-based access"
                value="admin"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-hairline pt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="pulse-dot size-2 rounded-full bg-[color:var(--success)]" />
              Systems online
            </span>
            <span className="font-mono text-foreground">{clock} UTC</span>
          </div>
        </div>
      </aside>

      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-xl border border-hairline bg-card p-8 shadow-[0_10px_32px_-20px_color-mix(in_oklab,var(--foreground)_18%,transparent)]">
          <div className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Admin access
          </div>
          <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.03em] text-foreground">
            Sign in
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use your admin credentials to access the Kittik management console.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <Field
              label="Email"
              hint="Registered admin address"
              input={
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@kittik.com"
                />
              }
            />
            <Field
              label="Password"
              hint={
                <button
                  type="button"
                  className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  forgot?
                </button>
              }
              input={
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                />
              }
            />

            {errorMessage ? <Notice tone="danger" message={errorMessage} /> : null}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? "Authenticating..." : "Continue"}
              {!loading ? (
                <ArrowRight
                  className="size-4 transition-transform group-hover/button:translate-x-0.5"
                  strokeWidth={2}
                />
              ) : null}
            </Button>

            <div className="flex items-center justify-between border-t border-hairline pt-4 text-xs text-muted-foreground">
              <span>Press</span>
              <span className="flex items-center gap-1.5">
                <Kbd>Enter</Kbd>
                <span>to sign in</span>
              </span>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  input,
}: {
  label: string;
  hint?: React.ReactNode;
  input: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint ? <span>{hint}</span> : null}
      </span>
      {input}
    </label>
  );
}

function FeatureLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-hairline bg-card px-4 py-3 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-3">
        <span className="text-primary">{icon}</span>
        <span>{label}</span>
      </span>
      <span className="font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}

function formatClock(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}
