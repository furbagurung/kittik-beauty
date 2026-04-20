"use client";

import type { Product } from "@/types/product";
import {
  BadgeDollarSign,
  Boxes,
  CircleAlert,
  FolderKanban,
  Layers3,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import ProductEditorHeader from "@/components/products/ProductEditorHeader";
import ProductEditorSection from "@/components/products/ProductEditorSection";
import ProductMediaPanel from "@/components/products/ProductMediaPanel";
import ProductSidebarCard from "@/components/products/ProductSidebarCard";
import ProductSummaryCard from "@/components/products/ProductSummaryCard";
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

export type ProductFormValues = {
  name: string;
  category: string;
  price: string;
  stock: number;
  status: Product["status"];
  description: string;
  primaryImageFile: File | null;
  galleryFiles: File[];
  existingGalleryImages: string[];
};

type ProductFormProps = {
  mode?: "create" | "edit";
  defaultValues?: Partial<Product>;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
};

const categoryOptions = [
  "Skincare",
  "Makeup",
  "Haircare",
  "Bodycare",
  "Fragrance",
  "Tools",
];

const statusOptions = ["Active", "Draft", "Archived", "Out of Stock"] as const;

function formatCurrency(value: string) {
  const numeric = Number(value || 0);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "NPR 0";
  }

  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export default function ProductForm({
  mode = "create",
  defaultValues,
  onSubmit,
}: ProductFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? "",
  );
  const [price, setPrice] = useState(defaultValues?.price ?? "");
  const [stock, setStock] = useState<number>(defaultValues?.stock ?? 0);
  const [category, setCategory] = useState(
    defaultValues?.category ?? "Skincare",
  );
  const [status, setStatus] = useState<Product["status"]>(
    (defaultValues?.status as Product["status"]) ?? "Active",
  );
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>(
    defaultValues?.images ?? [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const primaryInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(defaultValues?.name ?? "");
    setDescription(defaultValues?.description ?? "");
    setPrice(defaultValues?.price ?? "");
    setStock(defaultValues?.stock ?? 0);
    setCategory(defaultValues?.category ?? "Skincare");
    setStatus((defaultValues?.status as Product["status"]) ?? "Active");
    setPrimaryImageFile(null);
    setGalleryFiles([]);
    setExistingGalleryImages(defaultValues?.images ?? []);

    if (primaryInputRef.current) {
      primaryInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  }, [
    defaultValues?.category,
    defaultValues?.description,
    defaultValues?.images,
    defaultValues?.name,
    defaultValues?.price,
    defaultValues?.status,
    defaultValues?.stock,
  ]);

  const primaryPreviewUrl = useMemo(() => {
    if (primaryImageFile) {
      return URL.createObjectURL(primaryImageFile);
    }

    return defaultValues?.image ?? "";
  }, [defaultValues?.image, primaryImageFile]);

  useEffect(() => {
    if (!primaryImageFile || !primaryPreviewUrl) return;

    return () => {
      URL.revokeObjectURL(primaryPreviewUrl);
    };
  }, [primaryImageFile, primaryPreviewUrl]);

  const galleryPreviews = useMemo(
    () =>
      galleryFiles.map((file, index) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        id: `${file.name}-${file.lastModified}-${file.size}-${index}`,
      })),
    [galleryFiles],
  );

  useEffect(() => {
    return () => {
      galleryPreviews.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [galleryPreviews]);

  const previewPrice = useMemo(() => formatCurrency(price), [price]);
  const galleryCount = existingGalleryImages.length + galleryFiles.length;

  function resetLocalFiles() {
    setPrimaryImageFile(null);
    setGalleryFiles([]);
    setExistingGalleryImages(defaultValues?.images ?? []);

    if (primaryInputRef.current) {
      primaryInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  }

  function handleDiscard() {
    setName(defaultValues?.name ?? "");
    setDescription(defaultValues?.description ?? "");
    setPrice(defaultValues?.price ?? "");
    setStock(defaultValues?.stock ?? 0);
    setCategory(defaultValues?.category ?? "Skincare");
    setStatus((defaultValues?.status as Product["status"]) ?? "Active");
    resetLocalFiles();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!primaryImageFile && !defaultValues?.image) {
      alert("Please upload a primary image.");
      return;
    }

    const values: ProductFormValues = {
      name,
      category,
      price: String(price || ""),
      stock: Number(stock || 0),
      status,
      description,
      primaryImageFile,
      galleryFiles,
      existingGalleryImages,
    };

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePrimaryImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const nextFile = event.target.files?.[0] ?? null;
    setPrimaryImageFile(nextFile);
  }

  function handleGalleryImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const nextFiles = Array.from(event.target.files ?? []);

    if (!nextFiles.length) return;

    setGalleryFiles((current) => [...current, ...nextFiles]);
    event.target.value = "";
  }

  function removeGalleryFile(index: number) {
    setGalleryFiles((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  function removeExistingGalleryImage(imageUrl: string) {
    setExistingGalleryImages((current) =>
      current.filter((item) => item !== imageUrl),
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="status" value={status} />

      <ProductEditorHeader
        mode={mode}
        name={name}
        category={category}
        status={status}
        hasPrimaryImage={Boolean(primaryPreviewUrl)}
        isSubmitting={isSubmitting}
        onDiscard={handleDiscard}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <ProductEditorSection>
            <div className="space-y-5">
              <div className="grid gap-2.5">
                <Label htmlFor="name" className="text-[0.82rem] font-medium">
                  Title
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Velvet Glow Lip Tint"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-12 rounded-xl px-4 text-base font-medium"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-2.5 pt-7">
              <Label
                htmlFor="description"
                className="text-[0.82rem] font-medium"
              >
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Write a concise, useful description for shoppers and operators."
                rows={8}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-44 rounded-xl px-4 py-3"
                disabled={isSubmitting}
              />
            </div>
          </ProductEditorSection>

          <ProductEditorSection
            action={
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {galleryCount} gallery asset{galleryCount === 1 ? "" : "s"}
              </span>
            }
          >
            <ProductMediaPanel
              primaryPreviewUrl={primaryPreviewUrl}
              primaryImageFile={primaryImageFile}
              existingGalleryImages={existingGalleryImages}
              galleryPreviews={galleryPreviews}
              isSubmitting={isSubmitting}
              primaryInputRef={primaryInputRef}
              galleryInputRef={galleryInputRef}
              onPrimaryImageChange={handlePrimaryImageChange}
              onGalleryImageChange={handleGalleryImageChange}
              onClearPrimaryImage={() => {
                setPrimaryImageFile(null);
                if (primaryInputRef.current) {
                  primaryInputRef.current.value = "";
                }
              }}
              onRemoveExistingGalleryImage={removeExistingGalleryImage}
              onRemoveGalleryFile={removeGalleryFile}
            />
          </ProductEditorSection>

          <div className="grid gap-6 lg:grid-cols-2">
            <ProductEditorSection contentClassName="space-y-4">
              <div className="grid gap-2.5">
                <Label htmlFor="price" className="text-[0.82rem] font-medium">
                  Price
                </Label>
                <div className="relative">
                  <BadgeDollarSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min={0}
                    required
                    placeholder="0"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="h-11 rounded-xl pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/75 px-3.5 py-3 text-sm text-muted-foreground">
                  Preview price:{" "}
                  <span className="font-medium text-foreground">
                    {previewPrice}
                  </span>
                </div>
              </div>
            </ProductEditorSection>

            <ProductEditorSection contentClassName="space-y-4">
              <div className="grid gap-2.5">
                <Label htmlFor="stock" className="text-[0.82rem] font-medium">
                  Available units
                </Label>
                <div className="relative">
                  <Boxes className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={String(stock)}
                    onChange={(event) =>
                      setStock(Number(event.target.value || 0))
                    }
                    className="h-11 rounded-xl pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/75 px-3.5 py-3 text-sm text-muted-foreground">
                  Current summary:{" "}
                  <span className="font-medium text-foreground">
                    {Math.max(0, stock)} unit{stock === 1 ? "" : "s"} available
                  </span>
                </div>
              </div>
            </ProductEditorSection>
          </div>
        </div>

        <div className="self-start space-y-6 xl:sticky xl:top-28">
          <ProductSummaryCard
            mode={mode}
            name={name}
            category={category}
            priceLabel={previewPrice}
            stock={stock}
            primaryPreviewUrl={primaryPreviewUrl}
            galleryCount={galleryCount}
          />

          <ProductSidebarCard
            title="Product settings"
            description="Keep the real saved metadata visible and the workspace-only state clearly secondary."
          >
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-[0.82rem] font-medium">Category</Label>
                <div className="relative">
                  <FolderKanban className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary" />
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11 rounded-xl pl-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm leading-5 text-muted-foreground">
                  Category is saved with the product and helps keep the catalog
                  organized.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="surface-shadow-soft inline-flex size-9 items-center justify-center rounded-xl bg-card text-primary">
                    <Layers3 className="size-4" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Workspace status
                      </p>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        This is useful inside the editor today, but it is not
                        stored by the backend yet.
                      </p>
                    </div>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setStatus(value as Product["status"])
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger size="sm" className="rounded-xl bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="surface-shadow rounded-2xl border border-border/70 bg-card px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="inline-flex size-9 items-center justify-center rounded-xl bg-[color:color-mix(in_oklab,var(--destructive)_10%,var(--card))] text-[color:var(--destructive)]">
                    <CircleAlert className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      What gets saved
                    </p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Name, description, price, stock, category, and media are
                      part of the current API payload.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ProductSidebarCard>

          <div className="rounded-2xl border border-dashed border-border bg-muted/45 px-4 py-4 text-sm leading-6 text-muted-foreground">
            Add product notes, SEO controls, variants, or channel publishing
            only when the backend supports those fields. The editor stays
            intentionally focused on the current product model.
          </div>
        </div>
      </div>
    </form>
  );
}
