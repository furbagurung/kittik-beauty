const SLOW_QUERY_THRESHOLD_MS = 500;

function formatContext(context) {
  const entries = Object.entries(context).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );

  if (!entries.length) return "";

  return ` ${JSON.stringify(Object.fromEntries(entries))}`;
}

export async function timeQuery(label, operation, context = {}) {
  const startedAt = Date.now();

  try {
    return await operation();
  } finally {
    const durationMs = Date.now() - startedAt;

    if (durationMs > SLOW_QUERY_THRESHOLD_MS) {
      console.warn(
        `[slow-query] ${label} took ${durationMs}ms${formatContext(context)}`,
      );
    }
  }
}
