"use client";

import ConfirmActionDialog from "@/components/shared/ConfirmActionDialog";
import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  updateProductCategory,
  type AdminApiProductCategory,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function sortCategories(categories: AdminApiProductCategory[]) {
  return [...categories].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.name.localeCompare(right.name);
  });
}

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<AdminApiProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [editingCategory, setEditingCategory] =
    useState<AdminApiProductCategory | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<AdminApiProductCategory | null>(null);

  const sortedCategories = useMemo(
    () => sortCategories(categories),
    [categories],
  );
  const isEditing = Boolean(editingCategory);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const data = await getProductCategories();

        if (!cancelled) {
          setCategories(sortCategories(data));
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            getErrorMessage(error, "Failed to load product categories."),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm() {
    setName("");
    setSortOrder("0");
    setEditingCategory(null);
  }

  function startEdit(category: AdminApiProductCategory) {
    setEditingCategory(category);
    setName(category.name);
    setSortOrder(String(category.sortOrder));
    setErrorMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextName = name.trim();

    if (!nextName) {
      setErrorMessage("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const payload = {
        name: nextName,
        sortOrder: Number(sortOrder || 0),
      };
      const savedCategory = editingCategory
        ? await updateProductCategory(editingCategory.id, payload)
        : await createProductCategory(payload);

      setCategories((current) => {
        const exists = current.some((item) => item.id === savedCategory.id);
        return sortCategories(
          exists
            ? current.map((item) =>
                item.id === savedCategory.id ? savedCategory : item,
              )
            : [...current, savedCategory],
        );
      });
      resetForm();
      toast.success(editingCategory ? "Category updated" : "Category created");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Failed to save product category."),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setErrorMessage("");
      await deleteProductCategory(deleteTarget.id);
      setCategories((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      toast.success("Category deleted");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Failed to delete product category."),
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Catalog"
        title="Product categories"
        description="Create and organize the category list used by product editors."
        action={
          isEditing ? (
            <Button type="button" variant="outline" onClick={resetForm}>
              <X className="size-4" strokeWidth={2} />
              Cancel edit
            </Button>
          ) : null
        }
      />

      {errorMessage ? <Notice tone="danger" message={errorMessage} /> : null}

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit category" : "Create category"}
            </CardTitle>
            <CardDescription>
              Category names are used directly on product records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="categoryName">Name</Label>
                <Input
                  id="categoryName"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Skincare"
                  disabled={saving}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="categorySortOrder">Sort order</Label>
                <Input
                  id="categorySortOrder"
                  type="number"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  disabled={saving}
                />
              </div>

              <Button type="submit" disabled={saving}>
                {isEditing ? (
                  <Pencil className="size-4" strokeWidth={2} />
                ) : (
                  <Plus className="size-4" strokeWidth={2} />
                )}
                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Save category"
                    : "Create category"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Product counts block deletion until products are moved elsewhere.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-hairline">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline bg-secondary/70">
                    <th className="h-11 px-4 text-left font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Category
                    </th>
                    <th className="h-11 px-4 text-left font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Products
                    </th>
                    <th className="h-11 px-4 text-left font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Sort
                    </th>
                    <th className="h-11 px-4 text-right font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <tr
                        key={index}
                        className="border-b border-hairline/70 last:border-b-0"
                      >
                        <td className="px-4 py-4" colSpan={4}>
                          <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-muted" />
                        </td>
                      </tr>
                    ))
                  ) : sortedCategories.length ? (
                    sortedCategories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b border-hairline/70 last:border-b-0"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-foreground">
                            {category.name}
                          </div>
                          <div className="mt-1 font-mono text-xs text-muted-foreground">
                            {category.slug}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {category.productCount}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {category.sortOrder}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(category)}
                            >
                              <Pencil className="size-3.5" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteTarget(category)}
                            >
                              <Trash2 className="size-3.5" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-14 text-center text-sm text-muted-foreground"
                      >
                        No categories yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete "${deleteTarget?.name ?? "category"}"?`}
        description={
          deleteTarget?.productCount
            ? "This category is assigned to products. Move products out of it before deleting."
            : "This cannot be undone."
        }
        confirmLabel={deleting ? "Deleting..." : "Delete category"}
        disabled={deleting}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
