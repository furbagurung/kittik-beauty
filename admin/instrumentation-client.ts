type KittikAdminRuntimeError = {
  colno?: number;
  lineno?: number;
  message: string;
  source?: string;
  stack?: string;
  timestamp: string;
  type: "error" | "unhandledrejection";
};

declare global {
  interface Window {
    __kittikAdminRuntimeErrors?: KittikAdminRuntimeError[];
  }

  interface WindowEventMap {
    "kittik-admin-runtime-error": CustomEvent<KittikAdminRuntimeError>;
  }
}

function toErrorMessage(value: unknown) {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value);
  } catch {
    return "Unknown runtime error";
  }
}

function toErrorStack(value: unknown) {
  return value instanceof Error ? value.stack : undefined;
}

function recordRuntimeError(entry: KittikAdminRuntimeError) {
  window.__kittikAdminRuntimeErrors = [
    ...(window.__kittikAdminRuntimeErrors ?? []),
    entry,
  ].slice(-12);

  window.dispatchEvent(
    new CustomEvent("kittik-admin-runtime-error", {
      detail: entry,
    }),
  );
}

if (typeof window !== "undefined") {
  window.__kittikAdminRuntimeErrors =
    window.__kittikAdminRuntimeErrors ?? [];

  window.addEventListener("error", (event) => {
    recordRuntimeError({
      colno: event.colno,
      lineno: event.lineno,
      message: event.message || toErrorMessage(event.error),
      source: event.filename,
      stack: toErrorStack(event.error),
      timestamp: new Date().toISOString(),
      type: "error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    recordRuntimeError({
      message: toErrorMessage(event.reason),
      stack: toErrorStack(event.reason),
      timestamp: new Date().toISOString(),
      type: "unhandledrejection",
    });
  });
}

export {};
