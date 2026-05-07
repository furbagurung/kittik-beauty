const PRODUCTION_API_BASE_URL = "https://kittik.furkedesigns.com/api";
const DEVELOPMENT_API_BASE_URL = "http://localhost:5000/api";

function normalizeApiBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const pathname = url.pathname.replace(/\/+$/, "");

    if (pathname === "" || pathname === "/") {
      url.pathname = "/api";
    } else if (pathname === "/api/api") {
      url.pathname = "/api";
    } else if (!pathname.endsWith("/api")) {
      url.pathname = `${pathname}/api`;
    } else {
      url.pathname = pathname;
    }

    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/+$/, "");
  } catch {
    if (trimmed.endsWith("/api/api")) {
      return trimmed.slice(0, -4);
    }

    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }
}

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const fallbackApiBaseUrl =
  process.env.NODE_ENV === "production"
    ? PRODUCTION_API_BASE_URL
    : DEVELOPMENT_API_BASE_URL;

export const API_BASE_URL = normalizeApiBaseUrl(
  configuredApiBaseUrl || fallbackApiBaseUrl,
);
