const ADMIN_TOKEN_KEY = "adminToken";
const ADMIN_USER_KEY = "adminUser";
const ADMIN_SESSION_CHANGE_EVENT = "admin:user-change";

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

const SERVER_SNAPSHOT: AdminSession = {
  token: null,
  user: null,
};

// React 19 expects the same snapshot reference until the backing storage changes.
let cachedTokenRaw: string | null = null;
let cachedUserRaw: string | null = null;
let cachedSnapshot: AdminSession = SERVER_SNAPSHOT;

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

function parseAdminUser(raw: string | null): AdminUser | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isAdminUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function updateCachedSnapshot(
  tokenRaw: string | null,
  userRaw: string | null,
  user = parseAdminUser(userRaw),
) {
  cachedTokenRaw = tokenRaw;
  cachedUserRaw = userRaw;
  cachedSnapshot = {
    token: tokenRaw,
    user,
  };
  return cachedSnapshot;
}

export function readAdminSessionSnapshot(): AdminSession {
  const tokenRaw = readStorageValue(ADMIN_TOKEN_KEY);
  const userRaw = readStorageValue(ADMIN_USER_KEY);

  if (tokenRaw === cachedTokenRaw && userRaw === cachedUserRaw) {
    return cachedSnapshot;
  }

  return updateCachedSnapshot(tokenRaw, userRaw);
}

export function getServerAdminSessionSnapshot() {
  return SERVER_SNAPSHOT;
}

export function subscribeAdminSession(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      event.storageArea === window.localStorage &&
      (!event.key ||
        event.key === ADMIN_TOKEN_KEY ||
        event.key === ADMIN_USER_KEY)
    ) {
      callback();
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(ADMIN_SESSION_CHANGE_EVENT, callback);
  window.addEventListener("focus", callback);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(ADMIN_SESSION_CHANGE_EVENT, callback);
    window.removeEventListener("focus", callback);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

function dispatchSessionChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_SESSION_CHANGE_EVENT));
}

export function setAdminSession({ token, user }: AdminSession) {
  if (typeof window === "undefined") return;

  if (token === null) {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  } else {
    window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }

  const userRaw = user ? JSON.stringify(user) : null;

  if (userRaw === null) {
    window.localStorage.removeItem(ADMIN_USER_KEY);
  } else {
    window.localStorage.setItem(ADMIN_USER_KEY, userRaw);
  }

  updateCachedSnapshot(token, userRaw, user);
  dispatchSessionChange();
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_USER_KEY);

  updateCachedSnapshot(null, null, null);
  dispatchSessionChange();
}

export function getStoredAdminToken() {
  return readStorageValue(ADMIN_TOKEN_KEY);
}
