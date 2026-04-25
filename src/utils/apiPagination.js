const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function getFirstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(getFirstQueryValue(value), 10);

  return parsed || fallback;
}

export function getPaginationParams(query = {}) {
  const isPaginated = query.page !== undefined || query.limit !== undefined;
  const page = parseInteger(query.page, DEFAULT_PAGE);
  const limit = parseInteger(query.limit, DEFAULT_LIMIT);

  return {
    isPaginated,
    hasPagination: isPaginated,
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function buildPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
