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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createSubCategory,
  deleteSubCategory,
  getProductCategories,
  getSubCategories,
  updateSubCategory,
  type AdminApiProductCategory,
  type AdminApiSubCategory,
  type CatalogStatus,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function sortSubCategories(subCategories: AdminApiSubCategory[]) {
  return [...subCategories].sort((left, right) => {
    if (left.categoryId !== right.categoryId) return left.categoryId - right.categoryId;
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.name.localeCompare(right.name);
  });
}

export default function SubCategoriesPage() {
  const [categories, setCategories] = useState<AdminApiProductCategory[]>([]);
  const [subCategories, setSubCategories] = useState<AdminApiSubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingSubCategory, setEditingSubCategory] = useState<AdminApiSubCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminApiSubCategory | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<CatalogStatus>("ACTIVE");
  const [sortOrder, setSortOrder] = useState("0");
  const sortedSubCategories = useMemo(() => sortSubCategories(subCategories), [subCategories]);
  const isEditing = Boolean(editingSubCategory);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [categoryData, subCategoryData] = await Promise.all([
          getProductCategories(),
          getSubCategories(true),
        ]);

        if (!cancelled) {
          setCategories(categoryData);
          setSubCategories(sortSubCategories(subCategoryData));
          setCategoryId((current) => current || String(categoryData[0]?.id ?? ""));
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getErrorMessage(error, "Failed to load sub-categories."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm() {
    setEditingSubCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("");
    setCategoryId(String(categories[0]?.id ?? ""));
    setStatus("ACTIVE");
    setSortOrder("0");
  }

  function startEdit(subCategory: AdminApiSubCategory) {
    setEditingSubCategory(subCategory);
    setName(subCategory.name);
    setSlug(subCategory.slug);
    setDescription(subCategory.description ?? "");
    setImage(subCategory.image ?? "");
    setCategoryId(String(subCategory.categoryId));
    setStatus(subCategory.status);
    setSortOrder(String(subCategory.sortOrder));
    setErrorMessage("");
  }

  function categoryNameFor(id: number) {
    return categories.find((category) => category.id === id)?.name ?? "Category";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    const parsedCategoryId = Number(categoryId);

    if (!nextName || !Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
      setErrorMessage("Sub-category name and parent category are required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      const payload = {
        name: nextName,
        slug: slug.trim(),
        description: description.trim(),
        image: image.trim(),
        categoryId: parsedCategoryId,
        status,
        sortOrder: Number(sortOrder || 0),
      };
      const savedSubCategory = editingSubCategory
        ? await updateSubCategory(editingSubCategory.id, payload)
        : await createSubCategory(payload);

      setSubCategories((current) => {
        const exists = current.some((item) => item.id === savedSubCategory.id);
        return sortSubCategories(
          exists
            ? current.map((item) => (item.id === savedSubCategory.id ? savedSubCategory : item))
            : [...current, savedSubCategory],
        );
      });
      resetForm();
      toast.success(editingSubCategory ? "Sub-category updated" : "Sub-category created");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to save sub-category."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setErrorMessage("");
      const result = await deleteSubCategory(deleteTarget.id);
      const archivedSubCategory = result.subCategory;
      if (archivedSubCategory) {
        setSubCategories((current) =>
          sortSubCategories(
            current.map((item) =>
              item.id === archivedSubCategory.id ? archivedSubCategory : item,
            ),
          ),
        );
        toast.success("Sub-category archived");
      } else {
        setSubCategories((current) => current.filter((item) => item.id !== deleteTarget.id));
        toast.success("Sub-category deleted");
      }
      setDeleteTarget(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to delete sub-category."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        kicker="Catalog"
        title="Sub-categories"
        description="Manage product sub-categories under parent categories."
        action={
          isEditing ? (
            <Button type="button" variant="outline" onClick={resetForm}>
              <X data-icon="inline-start" />
              Cancel edit
            </Button>
          ) : null
        }
      />

      {errorMessage ? <Notice tone="danger" message={errorMessage} /> : null}

      <div className="grid gap-5 xl:grid-cols-[400px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit sub-category" : "Create sub-category"}</CardTitle>
            <CardDescription>Sub-categories belong to categories. Brands are assigned separately.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="subCategoryName">Name</Label>
                <Input id="subCategoryName" value={name} onChange={(event) => setName(event.target.value)} disabled={saving} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subCategorySlug">Slug</Label>
                <Input id="subCategorySlug" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="Auto-generated if empty" disabled={saving} />
              </div>
              <div className="grid gap-2">
                <Label>Parent category</Label>
                <Select value={categoryId} onValueChange={setCategoryId} disabled={saving || categories.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subCategoryDescription">Description</Label>
                <Textarea id="subCategoryDescription" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} disabled={saving} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subCategoryImage">Image URL</Label>
                <Input id="subCategoryImage" value={image} onChange={(event) => setImage(event.target.value)} disabled={saving} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as CatalogStatus)} disabled={saving}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subCategorySortOrder">Sort order</Label>
                  <Input id="subCategorySortOrder" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} disabled={saving} />
                </div>
              </div>
              <Button type="submit" disabled={saving || categories.length === 0}>
                {isEditing ? <Pencil data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
                {saving ? "Saving..." : isEditing ? "Save sub-category" : "Create sub-category"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sub-category list</CardTitle>
            <CardDescription>Sub-categories are filtered by category in the product editor.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-hairline">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline bg-secondary/70">
                    <th className="h-11 px-4 text-left font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">Sub-category</th>
                    <th className="h-11 px-4 text-left font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">Category</th>
                    <th className="h-11 px-4 text-left font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">Status</th>
                    <th className="h-11 px-4 text-left font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">Products</th>
                    <th className="h-11 px-4 text-right font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-8 text-muted-foreground" colSpan={5}>Loading sub-categories...</td>
                    </tr>
                  ) : sortedSubCategories.length ? (
                    sortedSubCategories.map((subCategory) => (
                      <tr key={subCategory.id} className="border-b border-hairline/70 last:border-b-0">
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-foreground">{subCategory.name}</div>
                          <div className="mt-1 font-mono text-xs text-muted-foreground">{subCategory.slug}</div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{categoryNameFor(subCategory.categoryId)}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{subCategory.status}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{subCategory.productCount}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => startEdit(subCategory)}>
                              <Pencil data-icon="inline-start" />
                              Edit
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteTarget(subCategory)}>
                              <Trash2 data-icon="inline-start" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-sm text-muted-foreground">No sub-categories yet.</td>
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
        title={`Delete "${deleteTarget?.name ?? "sub-category"}"?`}
        description={deleteTarget?.productCount ? "Assigned sub-categories are archived instead of deleted." : "This cannot be undone."}
        confirmLabel={deleting ? "Deleting..." : "Delete sub-category"}
        disabled={deleting}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
