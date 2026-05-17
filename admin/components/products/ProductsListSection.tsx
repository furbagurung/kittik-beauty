"use client";

import ProductsTable, {
  getProductStock,
  normalizeProductStatus,
} from "@/components/products/ProductsTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

function countActiveProducts(products: AdminApiProduct[]) {
  return products.filter(
    (product) => normalizeProductStatus(product) === "Active",
  ).length;
}

function countLowStockProducts(products: AdminApiProduct[]) {
  return products.filter((product) => {
    const stock = getProductStock(product);
    return stock != null && stock > 0 && stock <= 10;
  }).length;
}

function countOutOfStockProducts(products: AdminApiProduct[]) {
  return products.filter((product) => {
    const stock = getProductStock(product);
    return stock != null && stock <= 0;
  }).length;
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
  const [refreshToken, setRefreshToken] = useState(0);
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
  }, [
    page,
    limit,
    debouncedSearch,
    categoryFilter,
    statusFilter,
    stockFilter,
    refreshToken,
  ]);

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
  const showEmptyState =
    !loading && !errorMessage && products.length === 0 && total === 0;

  const stats = [
    {
      label: "Total products",
      value: total || products.length,
      description: total ? "Across your catalog" : "Visible on this page",
    },
    {
      label: "Active products",
      value: countActiveProducts(products),
      description: "Visible on this page",
    },
    {
      label: "Low stock",
      value: countLowStockProducts(products),
      description: "10 units or fewer",
    },
    {
      label: "Out of stock",
      value: countOutOfStockProducts(products),
      description: "No units available",
    },
  ];

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    setCategoryFilter(ALL_FILTERS);
    setStatusFilter(ALL_FILTERS);
    setStockFilter(ALL_FILTERS);
    setPage(1);
  }, []);

  const handleProductDeleted = useCallback(() => {
    if (products.length <= 1 && page > 1) {
      setPage((current) => Math.max(1, current - 1));
      return;
    }

    setRefreshToken((current) => current + 1);
  }, [page, products.length]);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular">
                {stat.value.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product filters</CardTitle>
          <CardDescription>
            Search and narrow the catalog without leaving the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search products by name, category, or SKU..."
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:items-center">
              <Select value={categoryFilter} onValueChange={onCategoryChange}>
                <SelectTrigger className="lg:w-[190px]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={ALL_FILTERS}>All categories</SelectItem>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="lg:w-[170px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={onStockChange}>
                <SelectTrigger className="lg:w-[160px]">
                  <SelectValue placeholder="All stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STOCK_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
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
                    className="inline-flex rounded-full text-muted-foreground hover:text-foreground"
                    onClick={filter.clear}
                  >
                    <X />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Unable to load products</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {showEmptyState ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-foreground">
                No products found
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Try adjusting your search or filters, or add your first product.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
              >
                Reset filters
              </Button>
              <Button asChild>
                <Link href="/products/new">
                  <Plus data-icon="inline-start" />
                  Add product
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ProductsTable
          products={products}
          loading={loading}
          pageSize={limit}
          onProductDeleted={handleProductDeleted}
        />
      )}

      <Card size="sm">
        <CardContent className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="text-xs text-muted-foreground">
            {total === 0
              ? "Showing 0 products"
              : `Showing ${rangeStart}-${rangeEnd} of ${total} ${
                  total === 1 ? "product" : "products"
                }`}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Rows per page
              </span>
              <Select
                value={String(limit)}
                onValueChange={onLimitChange}
                disabled={loading}
              >
                <SelectTrigger size="sm" className="w-[76px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {LIMIT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
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
                <ChevronLeft data-icon="inline-start" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={goNext}
                disabled={
                  loading || totalPages === 0 || currentPage >= totalPages
                }
              >
                Next
                <ChevronRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
