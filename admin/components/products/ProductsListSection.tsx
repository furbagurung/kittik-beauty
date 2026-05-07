"use client";

import ProductsTable from "@/components/products/ProductsTable";
import Notice from "@/components/shared/Notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getProductCategories,
  getProducts,
  type AdminApiProduct,
  type AdminApiProductCategory,
  type ProductListPaginationMeta,
} from "@/lib/api";
import { getAdminProductCategoryName } from "@/lib/product-category";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const LIMIT_OPTIONS = [10, 20, 50] as const;
const DEFAULT_LIMIT = 10;
const ALL_FILTERS = "all";
const SEARCH_DEBOUNCE_MS = 400;

const STATUS_OPTIONS = [
  { label: "All statuses", value: ALL_FILTERS },
  { label: "Active", value: "Active" },
  { label: "Draft", value: "Draft" },
  { label: "Archived", value: "Archived" },
  { label: "Out of Stock", value: "Out of Stock" },
];

const STOCK_OPTIONS = [
  { label: "All stock", value: ALL_FILTERS },
  { label: "In stock", value: "in_stock" },
  { label: "Low stock", value: "low_stock" },
  { label: "Out of stock", value: "out_of_stock" },
];

function getStockFilterLabel(value: string) {
  return STOCK_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export default function ProductsListSection() {
  const [products, setProducts] = useState<AdminApiProduct[]>([]);
  const [categories, setCategories] = useState<AdminApiProductCategory[]>([]);
  const [categoryLoadFailed, setCategoryLoadFailed] = useState(false);
  const [pagination, setPagination] =
    useState<ProductListPaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_FILTERS);
  const [statusFilter, setStatusFilter] = useState(ALL_FILTERS);
  const [stockFilter, setStockFilter] = useState(ALL_FILTERS);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    getProductCategories()
      .then((response) => {
        if (cancelled) return;
        setCategories(response);
        setCategoryLoadFailed(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCategories([]);
        setCategoryLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(async () => {
      if (cancelled) return;
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getProducts({
          page,
          limit,
          search: debouncedSearch || undefined,
          category:
            categoryFilter === ALL_FILTERS ? undefined : categoryFilter,
          status: statusFilter === ALL_FILTERS ? undefined : statusFilter,
          stock: stockFilter === ALL_FILTERS ? undefined : stockFilter,
        });

        if (cancelled) return;
        setProducts(response.data);
        setPagination(response.pagination);
      } catch (error) {
        if (cancelled) return;
        setProducts([]);
        setPagination(null);
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load products.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [page, limit, debouncedSearch, categoryFilter, statusFilter, stockFilter]);

  const fallbackCategories = useMemo(() => {
    const names = new Set<string>();

    for (const product of products) {
      const name = getAdminProductCategoryName(product.category, "").trim();
      if (name) names.add(name);
    }

    return Array.from(names).sort((left, right) => left.localeCompare(right));
  }, [products]);

  const categoryOptions = categoryLoadFailed
    ? fallbackCategories
    : categories.map((category) => category.name);

  const activeFilters = [
    debouncedSearch
      ? {
          key: "search",
          label: `Search: ${debouncedSearch}`,
          clear: () => {
            setSearchInput("");
            setDebouncedSearch("");
            setPage(1);
          },
        }
      : null,
    categoryFilter !== ALL_FILTERS
      ? {
          key: "category",
          label: `Category: ${categoryFilter}`,
          clear: () => {
            setCategoryFilter(ALL_FILTERS);
            setPage(1);
          },
        }
      : null,
    statusFilter !== ALL_FILTERS
      ? {
          key: "status",
          label: `Status: ${statusFilter}`,
          clear: () => {
            setStatusFilter(ALL_FILTERS);
            setPage(1);
          },
        }
      : null,
    stockFilter !== ALL_FILTERS
      ? {
          key: "stock",
          label: `Stock: ${getStockFilterLabel(stockFilter)}`,
          clear: () => {
            setStockFilter(ALL_FILTERS);
            setPage(1);
          },
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    clear: () => void;
  }>;

  const hasActiveFilters = activeFilters.length > 0;
  const totalPages = pagination?.totalPages ?? 0;
  const total = pagination?.total ?? 0;
  const currentPage = pagination?.page ?? page;
  const currentLimit = pagination?.limit ?? limit;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * currentLimit + 1;
  const rangeEnd = Math.min(currentPage * currentLimit, total);

  const resetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setCategoryFilter(ALL_FILTERS);
    setStatusFilter(ALL_FILTERS);
    setStockFilter(ALL_FILTERS);
    setPage(1);
  };

  const goPrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const goNext = () => {
    if (totalPages > 0 && currentPage < totalPages) setPage(currentPage + 1);
  };

  const onLimitChange = (value: string) => {
    const next = Number(value);
    if (!Number.isFinite(next) || next === limit) return;
    setLimit(next);
    setPage(1);
  };

  const onCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const onStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const onStockChange = (value: string) => {
    setStockFilter(value);
    setPage(1);
  };

  const showFilteredEmpty =
    !loading && !errorMessage && products.length === 0 && total === 0;

  return (
    <div className="flex flex-col gap-4">
      <Card size="sm">
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1 lg:max-w-xl">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2}
              />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search products by name, category, or SKU..."
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:items-center">
              <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="lg:w-[180px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_FILTERS}>All categories</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="lg:w-[160px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={onStockChange}>
                <SelectTrigger className="lg:w-[150px]">
                  <SelectValue placeholder="All stock" />
                </SelectTrigger>
                <SelectContent>
                  {STOCK_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
              >
                Reset filters
              </Button>
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter.key} variant="outline">
                  {filter.label}
                  <button
                    type="button"
                    aria-label={`Clear ${filter.label}`}
                    className="ml-1 inline-flex rounded-full text-muted-foreground hover:text-foreground"
                    onClick={filter.clear}
                  >
                    <X className="size-3" strokeWidth={2} />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {errorMessage ? <Notice tone="danger" message={errorMessage} /> : null}

      {showFilteredEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <div className="kicker">No results</div>
            <div className="text-sm font-medium text-foreground">
              No products found
            </div>
            <div className="text-sm text-muted-foreground">
              Try changing your search or filters.
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              Reset filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ProductsTable
          products={products}
          loading={loading}
          emptyLabel="No products found. Try changing your search or filters."
        />
      )}

      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-hairline bg-card px-4 py-3 sm:flex-row sm:items-center">
        <div className="text-xs text-muted-foreground">
          {total === 0
            ? "Showing 0 products"
            : `Showing ${rangeStart}-${rangeEnd} of ${total} ${
                total === 1 ? "product" : "products"
              }`}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows</span>
            <Select
              value={String(limit)}
              onValueChange={onLimitChange}
              disabled={loading}
            >
              <SelectTrigger size="sm" className="h-8 w-[72px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground">
            Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={loading || currentPage <= 1}
            >
              <ChevronLeft className="size-4" strokeWidth={2} />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={loading || totalPages === 0 || currentPage >= totalPages}
            >
              Next
              <ChevronRight className="size-4" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
