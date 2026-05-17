"use client";
/* eslint-disable @next/next/no-img-element */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProduct, type AdminApiProduct } from "@/lib/api";
import { formatNumber, formatShortDate } from "@/lib/format";
import { getAdminProductCategoryName } from "@/lib/product-category";
import { cn } from "@/lib/utils";
import { Edit, Eye, MoreHorizontal, Package, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type ProductsTableProps = {
  products: AdminApiProduct[];
  loading?: boolean;
  pageSize?: number;
  onProductDeleted?: () => void;
};

type ProductStatusLabel = "Active" | "Draft" | "Archived" | "Out of Stock";

export function getProductStock(product: AdminApiProduct) {
  const variantStock = product.defaultVariant?.stock;
  if (typeof variantStock === "number" && Number.isFinite(variantStock)) {
    return variantStock;
  }

  const productStock = product.stock;
  if (typeof productStock === "number" && Number.isFinite(productStock)) {
    return productStock;
  }

  return null;
}

export function normalizeProductStatus(
  product: AdminApiProduct,
): ProductStatusLabel {
  const stock = getProductStock(product);

  if (stock != null && stock <= 0) return "Out of Stock";

  const normalized = String(product.status ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");

  if (normalized === "active") return "Active";
  if (normalized === "archived") return "Archived";
  if (normalized === "out of stock") return "Out of Stock";

  return "Draft";
}

function formatPrice(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
  return `Rs. ${value.toLocaleString()}`;
}

function getStockBadge(stock: number | null) {
  if (stock == null) {
    return {
      label: "Unknown",
      variant: "secondary" as const,
      className: "text-muted-foreground",
    };
  }

  if (stock <= 0) {
    return {
      label: "Out of stock",
      variant: "destructive" as const,
      className: "",
    };
  }

  if (stock <= 10) {
    return {
      label: "Low stock",
      variant: "outline" as const,
      className: "text-[color:var(--warn)]",
    };
  }

  return {
    label: "In stock",
    variant: "secondary" as const,
    className: "",
  };
}

function getStatusBadge(status: ProductStatusLabel) {
  if (status === "Active") {
    return {
      variant: "default" as const,
      className: "",
    };
  }

  if (status === "Out of Stock") {
    return {
      variant: "destructive" as const,
      className: "",
    };
  }

  if (status === "Archived") {
    return {
      variant: "outline" as const,
      className: "text-muted-foreground",
    };
  }

  return {
    variant: "secondary" as const,
    className: "",
  };
}

function getProductImage(product: AdminApiProduct) {
  return (
    product.defaultVariant?.image ||
    product.image ||
    product.featuredImage ||
    product.media?.[0]?.url ||
    product.images?.[0] ||
    ""
  );
}

function getVariantMeta(product: AdminApiProduct) {
  const sku = product.defaultVariant?.sku?.trim();
  if (sku) return `SKU ${sku}`;

  const title = product.defaultVariant?.title?.trim();
  if (title && title !== "Default Title") return title;

  return "Default variant";
}

function getProductDate(product: AdminApiProduct) {
  const date = product.updatedAt || product.createdAt;
  if (!date) return "";

  return formatShortDate(date);
}

function ProductSkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-lg" />
              <div className="flex min-w-40 flex-col gap-2">
                <Skeleton className="h-3.5 w-40 rounded-full" />
                <Skeleton className="h-3 w-28 rounded-full" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-3.5 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-3.5 w-24 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="ml-auto size-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function ProductsTable({
  products,
  loading,
  pageSize = 10,
  onProductDeleted,
}: ProductsTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<AdminApiProduct | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await deleteProduct(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
      onProductDeleted?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="min-w-[280px] px-4">Product</TableHead>
                <TableHead className="min-w-[190px]">Catalog</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[140px]">Updated</TableHead>
                <TableHead className="w-12 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <ProductSkeletonRows count={Math.min(pageSize, 10)} />
              ) : (
                products.map((product) => {
                  const stock = getProductStock(product);
                  const stockBadge = getStockBadge(stock);
                  const status = normalizeProductStatus(product);
                  const statusBadge = getStatusBadge(status);
                  const category = getAdminProductCategoryName(
                    product.category,
                  );
                  const subCategory = product.subCategory?.name;
                  const brand = product.brand?.name;
                  const image = getProductImage(product);
                  const date = getProductDate(product);

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                            {image ? (
                              <img
                                src={image}
                                alt=""
                                className="size-full object-cover"
                              />
                            ) : (
                              <Package className="text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/products/${product.id}`}
                              className="block truncate text-sm font-medium text-foreground hover:underline"
                            >
                              {product.name || "Untitled product"}
                            </Link>
                            <p className="truncate text-xs text-muted-foreground">
                              {getVariantMeta(product)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1.5">
                          {category === "Uncategorized" ? (
                            <span className="text-sm text-muted-foreground">
                              Uncategorized
                            </span>
                          ) : (
                            <Badge variant="outline">{category}</Badge>
                          )}
                          {subCategory ? (
                            <span className="text-xs text-muted-foreground">
                              {subCategory}
                            </span>
                          ) : null}
                          {brand ? (
                            <span className="text-xs font-medium text-muted-foreground">
                              Brand: {brand}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono tabular">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={stockBadge.variant}
                            className={stockBadge.className}
                          >
                            {stockBadge.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {stock == null
                              ? "No stock data"
                              : `${formatNumber(Math.max(0, stock))} units`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusBadge.variant}
                          className={statusBadge.className}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {date ? (
                          <span className="text-sm text-muted-foreground">
                            {date}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Open actions for ${product.name}`}
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/products/${product.id}`}>
                                <Edit />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/products/${product.id}`}>
                                <Eye />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setDeleteTarget(product)}
                            >
                              <Trash2 />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.name || "product"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the product from the catalog. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                "border-[color:color-mix(in_oklab,var(--destructive)_22%,transparent)] bg-[color:color-mix(in_oklab,var(--destructive)_10%,var(--card))] text-[color:var(--destructive)] hover:bg-[color:color-mix(in_oklab,var(--destructive)_14%,var(--card))]",
              )}
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
            >
              {deleting ? "Deleting..." : "Delete product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
