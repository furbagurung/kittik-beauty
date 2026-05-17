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
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
  type AdminApiBrand,
  type CatalogStatus,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function sortBrands(brands: AdminApiBrand[]) {
  return [...brands].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
    return left.name.localeCompare(right.name);
  });
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<AdminApiBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingBrand, setEditingBrand] = useState<AdminApiBrand | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminApiBrand | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [status, setStatus] = useState<CatalogStatus>("ACTIVE");
  const [sortOrder, setSortOrder] = useState("0");
  const sortedBrands = useMemo(() => sortBrands(brands), [brands]);
  const isEditing = Boolean(editingBrand);

  useEffect(() => {
    let cancelled = false;

    async function loadBrands() {
      try {
        const data = await getBrands(true);
        if (!cancelled) {
          setBrands(sortBrands(data));
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(getErrorMessage(error, "Failed to load brands."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBrands();

    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm() {
    setEditingBrand(null);
    setName("");
    setSlug("");
    setDescription("");
    setLogo("");
    setStatus("ACTIVE");
    setSortOrder("0");
  }

  function startEdit(brand: AdminApiBrand) {
    setEditingBrand(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setDescription(brand.description ?? "");
    setLogo(brand.logo ?? "");
    setStatus(brand.status);
    setSortOrder(String(brand.sortOrder));
    setErrorMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();

    if (!nextName) {
      setErrorMessage("Brand name is required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      const payload = {
        name: nextName,
        slug: slug.trim(),
        description: description.trim(),
        logo: logo.trim(),
        status,
        sortOrder: Number(sortOrder || 0),
      };
      const savedBrand = editingBrand
        ? await updateBrand(editingBrand.id, payload)
        : await createBrand(payload);

      setBrands((current) => {
        const exists = current.some((item) => item.id === savedBrand.id);
        return sortBrands(
          exists
            ? current.map((item) => (item.id === savedBrand.id ? savedBrand : item))
            : [...current, savedBrand],
        );
      });
      resetForm();
      toast.success(editingBrand ? "Brand updated" : "Brand created");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to save brand."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setErrorMessage("");
      const result = await deleteBrand(deleteTarget.id);
      const archivedBrand = result.brand;
      if (archivedBrand) {
        setBrands((current) =>
          sortBrands(
            current.map((item) =>
              item.id === archivedBrand.id ? archivedBrand : item,
            ),
          ),
        );
        toast.success("Brand archived");
      } else {
        setBrands((current) => current.filter((item) => item.id !== deleteTarget.id));
        toast.success("Brand deleted");
      }
      setDeleteTarget(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to delete brand."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        kicker="Catalog"
        title="Brands"
        description="Manage brand records independently from categories and sub-categories."
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

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit brand" : "Create brand"}</CardTitle>
            <CardDescription>Use logo URL for now; upload can be added later.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="brandName">Name</Label>
                <Input id="brandName" value={name} onChange={(event) => setName(event.target.value)} disabled={saving} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brandSlug">Slug</Label>
                <Input id="brandSlug" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="Auto-generated if empty" disabled={saving} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brandDescription">Description</Label>
                <Textarea id="brandDescription" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} disabled={saving} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="brandLogo">Logo URL</Label>
                <Input id="brandLogo" value={logo} onChange={(event) => setLogo(event.target.value)} disabled={saving} />
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
                  <Label htmlFor="brandSortOrder">Sort order</Label>
                  <Input id="brandSortOrder" type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} disabled={saving} />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {isEditing ? <Pencil data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
                {saving ? "Saving..." : isEditing ? "Save brand" : "Create brand"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Brand list</CardTitle>
            <CardDescription>Brands are assigned directly to products.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-hairline">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline bg-secondary/70">
                    <th className="h-11 px-4 text-left font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">Brand</th>
                    <th className="h-11 px-4 text-left font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">Status</th>
                    <th className="h-11 px-4 text-left font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">Products</th>
                    <th className="h-11 px-4 text-right font-mono text-[0.67rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-4 py-8 text-muted-foreground" colSpan={4}>Loading brands...</td>
                    </tr>
                  ) : sortedBrands.length ? (
                    sortedBrands.map((brand) => (
                      <tr key={brand.id} className="border-b border-hairline/70 last:border-b-0">
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-foreground">{brand.name}</div>
                          <div className="mt-1 font-mono text-xs text-muted-foreground">{brand.slug}</div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{brand.status}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{brand.productCount}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => startEdit(brand)}>
                              <Pencil data-icon="inline-start" />
                              Edit
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteTarget(brand)}>
                              <Trash2 data-icon="inline-start" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-14 text-center text-sm text-muted-foreground">No brands yet.</td>
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
        title={`Delete "${deleteTarget?.name ?? "brand"}"?`}
        description={deleteTarget?.productCount ? "Assigned brands are archived instead of deleted." : "This cannot be undone."}
        confirmLabel={deleting ? "Deleting..." : "Delete brand"}
        disabled={deleting}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
