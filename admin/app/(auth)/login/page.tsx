"use client";

import { bootstrapAdminSession, setAdminSession } from "@/lib/admin-session";
import { adminLogin, getCurrentAdmin } from "@/lib/api";
import { useAdminSession } from "@/lib/use-admin-session";
import { ShieldCheck, Store, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RuntimeErrorEntry = NonNullable<
  Window["__kittikAdminRuntimeErrors"]
>[number];

export default function AdminLoginPage() {
  const router = useRouter();
  const { status } = useAdminSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [interactiveStatus, setInteractiveStatus] = useState("server rendered");
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [clock, setClock] = useState("00:00:00");

  useEffect(() => {
    setInteractiveStatus("hydrated");
    pushDebug("hydrated");
  }, []);

  useEffect(() => {
    function reportRuntimeError(entry: RuntimeErrorEntry) {
      pushDebug(`runtime ${entry.type}: ${entry.message}`);
    }

    for (const entry of window.__kittikAdminRuntimeErrors ?? []) {
      reportRuntimeError(entry);
    }

    function handleRuntimeError(
      event: WindowEventMap["kittik-admin-runtime-error"],
    ) {
      reportRuntimeError(event.detail);
    }

    window.addEventListener("kittik-admin-runtime-error", handleRuntimeError);

    return () => {
      window.removeEventListener(
        "kittik-admin-runtime-error",
        handleRuntimeError,
      );
    };
  }, []);

  useEffect(() => {
    setClock(formatClock(new Date()));
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

  function pushDebug(message: string) {
    console.debug(`[admin-login] ${message}`);
    setDebugMessages((messages) => [...messages.slice(-10), message]);
  }

  async function runLogin() {
    if (loading) {
      pushDebug("submit ignored: already loading");
      return;
    }

    setErrorMessage("");
    setInteractiveStatus("button clicked");
    pushDebug("button clicked");
    pushDebug(
      `credentials present: email=${Boolean(email)}, password=${Boolean(password)}`,
    );

    if (!email || !password) {
      setErrorMessage("Enter an email and password to continue.");
      pushDebug("validation blocked: missing credentials");
      return;
    }

    try {
      setLoading(true);
      pushDebug("calling login");
      const response = await adminLogin({ email, password });
      pushDebug("login ok");
      pushDebug("calling admin me");
      const adminUser = await getCurrentAdmin(response.token);
      pushDebug(`admin me ok: ${adminUser.email}`);
      setAdminSession({
        token: response.token,
        user: adminUser,
      });
      pushDebug(
        `storage persisted: ${Boolean(localStorage.getItem("admin_token"))}`,
      );
      setInteractiveStatus("done");
      pushDebug("done");
      router.replace("/");
    } catch (error) {
      console.error("[admin-login] failed", error);
      setInteractiveStatus("error");
      pushDebug("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Admin login failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@kittik.com"
                className="h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-foreground">
                Password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Admin123@"
                className="h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>

            {errorMessage ? (
              <div className="rounded-lg border border-[color:color-mix(in_oklab,var(--destructive)_24%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_10%,var(--card))] px-3.5 py-2.5 text-sm font-medium text-[color:var(--destructive)]">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="button"
              disabled={loading}
              onClick={() => void runLogin()}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground shadow-[0_1px_0_0_var(--primary-strong)] transition hover:bg-[color:var(--primary-strong)] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Continue"}
            </button>

            <div className="rounded-lg border border-hairline bg-secondary/45 p-3 text-xs text-muted-foreground">
              <div className="mb-2 font-medium text-foreground">
                Interactive status: {interactiveStatus}
              </div>
              {debugMessages.length ? (
                <ol className="grid gap-1">
                  {debugMessages.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ol>
              ) : (
                <div>waiting for hydration</div>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
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
