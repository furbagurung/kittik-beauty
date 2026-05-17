export function slugify(value, fallback = "item") {
  const slug = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

export function normalizeName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function parseSortOrder(value) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

export function normalizeCatalogStatus(value) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  return normalized === "ARCHIVED" ? "ARCHIVED" : "ACTIVE";
}
