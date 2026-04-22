import { API_BASE_URL } from "@/lib/api-config";

const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_USER_KEY = "adminUser";
const ADMIN_SESSION_CHANGE_EVENT = "admin:user-change";
const SESSION_VALIDATION_TIMEOUT_MS = 8000;

export type AdminAuthStatus =
  | "idle"
  | "hydrating"
  | "authenticated"
  | "unauthenticated";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type AdminSession = {
  token: string | null;
  user: AdminUser | null;
};

export type AdminSessionSnapshot = AdminSession & {
  status: AdminAuthStatus;
  hasHydrated: boolean;
  error: string | null;
};

const SERVER_SNAPSHOT: AdminSessionSnapshot = {
  token: null,
  user: null,
  status: "idle",
  hasHydrated: false,
  error: null,
};

let snapshot: AdminSessionSnapshot = SERVER_SNAPSHOT;
let bootstrapPromise: Promise<AdminSessionSnapshot> | null = null;
let bootstrapToken: string | null = null;
let bootstrapRunId = 0;
let sessionVersion = 0;

const listeners = new Set<() => void>();

function isAdminUser(value: unknown): value is AdminUser {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "number" &&
    typeof record.name === "string" &&
    typeof record.email === "string" &&
    typeof record.role === "string"
  );
}

function readStorageValue(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeStorageValue(key: string, value: string | null) {
  if (typeof window === "undefined") return;

  if (value === null) {
    window.localStorage.removeItem(key);
  } else {
    window.localStorage.setItem(key, value);
  }
}

function parseAdminUser(raw: string | null): AdminUser | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isAdminUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function emitSessionChange() {
  for (const listener of listeners) {
    listener();
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_SESSION_CHANGE_EVENT));
  }
}

function setSnapshot(next: AdminSessionSnapshot) {
  snapshot = next;
  emitSessionChange();
  return snapshot;
}

function clearPersistedSession() {
  writeStorageValue(ADMIN_TOKEN_KEY, null);
  writeStorageValue(ADMIN_USER_KEY, null);
}

function readPersistedSession(): AdminSession {
  return {
    token: readStorageValue(ADMIN_TOKEN_KEY),
    user: parseAdminUser(readStorageValue(ADMIN_USER_KEY)),
  };
}

async function validateAdminToken(token: string) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    SESSION_VALIDATION_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        response.status === 401 || response.status === 403
          ? "Invalid admin session."
          : `Session validation failed: ${response.status}`,
      );
    }

    const data = (await response.json()) as unknown;

    if (!isAdminUser(data)) {
      throw new Error("Invalid admin session response.");
    }

    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Admin session validation timed out.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function readAdminSessionSnapshot() {
  return snapshot;
}

export function getServerAdminSessionSnapshot() {
  return SERVER_SNAPSHOT;
}

export function subscribeAdminSession(callback: () => void) {
  listeners.add(callback);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(callback);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.storageArea === window.localStorage &&
      (!event.key ||
        event.key === ADMIN_TOKEN_KEY ||
        event.key === ADMIN_USER_KEY)
    ) {
      bootstrapPromise = null;
      bootstrapToken = null;
      bootstrapRunId += 1;
      void bootstrapAdminSession({ force: true });
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function setAdminSession({ token, user }: AdminSession) {
  if (typeof window === "undefined") return snapshot;

  if (!token || !user) {
    return clearAdminSession();
  }

  writeStorageValue(ADMIN_TOKEN_KEY, token);
  writeStorageValue(ADMIN_USER_KEY, JSON.stringify(user));
  sessionVersion += 1;
  bootstrapRunId += 1;
  bootstrapPromise = null;
  bootstrapToken = token;

  return setSnapshot({
    token,
    user,
    status: "authenticated",
    hasHydrated: true,
    error: null,
  });
}

export function clearAdminSession() {
  clearPersistedSession();
  sessionVersion += 1;
  bootstrapRunId += 1;
  bootstrapPromise = null;
  bootstrapToken = null;

  return setSnapshot({
    token: null,
    user: null,
    status: "unauthenticated",
    hasHydrated: true,
    error: null,
  });
}

export function getStoredAdminToken() {
  return snapshot.token ?? readStorageValue(ADMIN_TOKEN_KEY);
}

export async function bootstrapAdminSession({
  force = false,
}: { force?: boolean } = {}) {
  if (typeof window === "undefined") return snapshot;

  const persisted = readPersistedSession();
  const token = persisted.token;

  if (!force && snapshot.status === "authenticated" && snapshot.token === token) {
    return snapshot;
  }

  if (!token) {
    clearPersistedSession();
    sessionVersion += 1;
    bootstrapRunId += 1;
    bootstrapPromise = null;
    bootstrapToken = null;
    return setSnapshot({
      token: null,
      user: null,
      status: "unauthenticated",
      hasHydrated: true,
      error: null,
    });
  }

  if (bootstrapPromise && bootstrapToken === token) {
    return bootstrapPromise;
  }

  const runId = bootstrapRunId + 1;
  const runSessionVersion = sessionVersion;
  bootstrapRunId = runId;
  bootstrapToken = token;
  setSnapshot({
    token,
    user: persisted.user,
    status: "hydrating",
    hasHydrated: true,
    error: null,
  });

  bootstrapPromise = validateAdminToken(token)
    .then((user) => {
      if (
        bootstrapRunId !== runId ||
        sessionVersion !== runSessionVersion ||
        readStorageValue(ADMIN_TOKEN_KEY) !== token
      ) {
        return snapshot;
      }

      writeStorageValue(ADMIN_USER_KEY, JSON.stringify(user));
      return setSnapshot({
        token,
        user,
        status: "authenticated",
        hasHydrated: true,
        error: null,
      });
    })
    .catch((error) => {
      if (
        bootstrapRunId !== runId ||
        sessionVersion !== runSessionVersion ||
        readStorageValue(ADMIN_TOKEN_KEY) !== token
      ) {
        return snapshot;
      }

      clearPersistedSession();
      sessionVersion += 1;
      return setSnapshot({
        token: null,
        user: null,
        status: "unauthenticated",
        hasHydrated: true,
        error:
          error instanceof Error
            ? error.message
            : "Failed to restore admin session.",
      });
    })
    .finally(() => {
      if (bootstrapRunId === runId) {
        bootstrapPromise = null;
      }
    });

  return bootstrapPromise;
}
