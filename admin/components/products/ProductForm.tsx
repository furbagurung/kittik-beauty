"use client";

import type { Product } from "@/types/product";
import {
  Boxes,
  CircleAlert,
  FolderKanban,
  Layers3,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import ProductEditorHeader from "@/components/products/ProductEditorHeader";
import ProductMediaSection from "@/components/products/ProductMediaSection";
import ProductSidebarCard from "@/components/products/ProductSidebarCard";
import ProductSummaryCard from "@/components/products/ProductSummaryCard";
import { useProductMedia } from "@/components/products/useProductMedia";
import ConfirmActionDialog from "@/components/shared/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
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
import { getProductCategories, type AdminApiProductCategory } from "@/lib/api";
import {
  getAdminProductCategoryId,
  getAdminProductCategoryName,
} from "@/lib/product-category";

export type ProductFormValues = {
  name: string;
  category: string;
  categoryId: number | null;
  price: string;
  stock: number;
  status: Product["status"];
  description: string;
  image?: string;
  primaryImageFile: File | null;
  galleryFiles: File[];
  existingGalleryImages: string[];
  options: NonNullable<Product["options"]>;
  variants: NonNullable<Product["variants"]>;
  tags: string[];
  productType: string;
  vendor: string;
  seoTitle: string;
  seoDescription: string;
  variantImageFiles: Array<{ key: string; file: File }>;
};

type ProductFormProps = {
  mode?: "create" | "edit";
  defaultValues?: Partial<Product>;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
};

const statusOptions: Product["status"][] = [
  "Active",
  "Draft",
  "Archived",
  "Out of Stock",
];

type ProductOptionDraft = {
  name: string;
  values: string[];
};

type VariantImageFileEntry = {
  file: File;
  previewUrl: string;
};

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

function ProductEditorCard({
  children,
  description = "Core product details for the storefront catalog.",
  title = "Product editor",
}: {
  children: ReactNode;
  description?: string;
  title?: string;
}) {
  return (
    <section className="surface-shadow overflow-hidden rounded-xl border border-border/80 bg-card">
      <div className="px-4 pb-2.5 pt-3.5 sm:px-5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="space-y-1.5 px-4 pb-4 sm:px-5">{children}</div>
    </section>
  );
}

function ProductEditorField({
  children,
  className,
  helper,
  htmlFor,
  label,
}: {
  children: ReactNode;
  className?: string;
  helper?: string;
  htmlFor?: string;
  label: string;
}) {
  return (
    <div
      className={`rounded-lg border border-transparent px-0 py-1.5 ${className ?? ""}`}
    >
      <div className="grid gap-2">
        <Label
          htmlFor={htmlFor}
          className="text-[0.8rem] font-medium text-foreground"
        >
          {label}
        </Label>
        {children}
        {helper ? (
          <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
        ) : null}
      </div>
    </div>
  );
}

function createDefaultVariant(
  price: string,
  stock: number,
  image?: string,
): NonNullable<Product["variants"]>[number] {
  return {
    title: "Default Title",
    price: Number(price || 0),
    stock: Number(stock || 0),
    image: image ?? null,
    isDefault: true,
    position: 0,
  };
}

function normalizeIncomingVariants(
  variants: Product["variants"] | undefined,
  price: string,
  stock: number,
  image?: string,
) {
  if (!variants?.length) {
    return [createDefaultVariant(price, stock, image)];
  }

  return variants.map((variant, index) => ({
    ...variant,
    image: variant.image ?? null,
    isDefault: variants.some((candidate) => candidate.isDefault)
      ? Boolean(variant.isDefault)
      : index === 0,
    position: variant.position ?? index,
  }));
}

function shouldShowVariantEditor(defaultValues?: Partial<Product>) {
  return Boolean(
    defaultValues?.options?.length ||
    (defaultValues?.variants?.length ?? 0) > 1,
  );
}

function resolveInitialCategoryId(
  defaultValues: Partial<Product> | undefined,
  categories: AdminApiProductCategory[],
  mode: "create" | "edit",
) {
  const explicitId =
    defaultValues?.categoryId ??
    getAdminProductCategoryId(defaultValues?.category);

  if (explicitId != null) {
    return String(explicitId);
  }

  const categoryName = getAdminProductCategoryName(defaultValues?.category, "");
  const matchingCategory = categoryName
    ? categories.find((item) => item.name === categoryName)
    : null;

  return matchingCategory
    ? String(matchingCategory.id)
    : mode === "create"
      ? String(categories[0]?.id ?? "")
      : "";
}

function getVariantImageFileKey(
  variant: NonNullable<Product["variants"]>[number],
  index: number,
) {
  if (variant.imageFileKey) return variant.imageFileKey;
  if (variant.id) return `variant-${variant.id}`;
  return `variant-${index}`;
}

function getVariantRowKey(
  variant: NonNullable<Product["variants"]>[number],
  index: number,
) {
  if (variant.id) return `variant-${variant.id}`;
  return `variant-${variant.position ?? index}`;
}

function generateVariantsFromOption(
  optionValues: string[],
  price: string,
  stock: number,
): NonNullable<Product["variants"]> {
  if (!optionValues.length) {
    return [createDefaultVariant(price, stock)];
  }

  return optionValues.map((value, index) => ({
    title: value,
    price: Number(price || 0),
    stock: Number(stock || 0),
    image: null,
    isDefault: index === 0,
    position: index,
  }));
}

export default function ProductForm({
  mode = "create",
  defaultValues,
  onSubmit,
  onDelete,
}: ProductFormProps) {
  const [hasVariants, setHasVariants] = useState(() =>
    shouldShowVariantEditor(defaultValues),
  );
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? "",
  );
  const [price, setPrice] = useState(defaultValues?.price ?? "");
  const [stock, setStock] = useState<number>(defaultValues?.stock ?? 0);
  const [categoryId, setCategoryId] = useState(
    () => resolveInitialCategoryId(defaultValues, [], mode),
  );
  const [categories, setCategories] = useState<AdminApiProductCategory[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const [status, setStatus] = useState<Product["status"]>(
    (defaultValues?.status as Product["status"]) ?? "Active",
  );
  const [options, setOptions] = useState<NonNullable<Product["options"]>>(
    defaultValues?.options ?? [],
  );
  const [variants, setVariants] = useState<NonNullable<Product["variants"]>>(
    () =>
      normalizeIncomingVariants(
        defaultValues?.variants,
        String(defaultValues?.price ?? ""),
        defaultValues?.stock ?? 0,
        defaultValues?.image,
      ),
  );
  const [editingOptionIndex, setEditingOptionIndex] = useState<number | null>(
    null,
  );
  const [optionDraft, setOptionDraft] = useState<ProductOptionDraft | null>(
    null,
  );
  const [variantImageFiles, setVariantImageFiles] = useState<
    Record<string, VariantImageFileEntry>
  >({});
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const variantImageFilesRef = useRef<Record<string, VariantImageFileEntry>>(
    {},
  );
  const [tagsText, setTagsText] = useState(
    (defaultValues?.tags ?? []).join(", "),
  );
  const [productType, setProductType] = useState(
    defaultValues?.productType ?? "",
  );
  const [vendor, setVendor] = useState(defaultValues?.vendor ?? "");
  const [seoTitle, setSeoTitle] = useState(defaultValues?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    defaultValues?.seoDescription ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const {
    items: mediaItems,
    primaryItem,
    galleryItems,
    hasPrimary,
    existingGalleryImages,
    galleryFiles,
    primaryImageFile,
    primaryExistingImage,
    dropzoneError,
    acceptFiles,
    moveItem,
    removeItem,
    replacePrimary,
    setPrimary,
    reset: resetMedia,
    reportDropzoneError,
  } = useProductMedia({
    initialPrimaryImage: defaultValues?.image ?? "",
    initialGalleryImages: defaultValues?.images ?? [],
  });

  useEffect(() => {
    setName(defaultValues?.name ?? "");
    setDescription(defaultValues?.description ?? "");
    setPrice(defaultValues?.price ?? "");
    setStock(defaultValues?.stock ?? 0);
    setCategoryId(resolveInitialCategoryId(defaultValues, [], mode));
    setStatus((defaultValues?.status as Product["status"]) ?? "Active");
    setOptions(defaultValues?.options ?? []);
    setHasVariants(shouldShowVariantEditor(defaultValues));
    setVariants(
      normalizeIncomingVariants(
        defaultValues?.variants,
        String(defaultValues?.price ?? ""),
        defaultValues?.stock ?? 0,
        defaultValues?.image,
      ),
    );
    setTagsText((defaultValues?.tags ?? []).join(", "));
    setProductType(defaultValues?.productType ?? "");
    setVendor(defaultValues?.vendor ?? "");
    setSeoTitle(defaultValues?.seoTitle ?? "");
    setSeoDescription(defaultValues?.seoDescription ?? "");
    setEditingOptionIndex(null);
    setOptionDraft(null);
    setSelectedVariantIds([]);
    setBulkPrice("");
    setBulkStock("");
    clearVariantImageFiles();
  }, [
    defaultValues?.category,
    defaultValues?.categoryId,
    defaultValues?.description,
    defaultValues?.image,
    defaultValues?.name,
    defaultValues?.options,
    defaultValues?.price,
    defaultValues?.productType,
    defaultValues?.seoDescription,
    defaultValues?.seoTitle,
    defaultValues?.status,
    defaultValues?.stock,
    defaultValues?.tags,
    defaultValues?.variants,
    defaultValues?.vendor,
    mode,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setCategoriesLoaded(false);

      try {
        const data = await getProductCategories();

        if (!cancelled) {
          setCategories(data);
          setCategoriesError("");
          setCategoriesLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
          setCategories([]);
          setCategoriesLoaded(true);
          setCategoriesError(
            error instanceof Error
              ? error.message
              : "Failed to load product categories.",
          );
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!categoriesLoaded) return;

    setCategoryId((current) =>
      current || resolveInitialCategoryId(defaultValues, categories, mode),
    );
  }, [
    categories,
    categoriesLoaded,
    defaultValues?.category,
    defaultValues?.categoryId,
    mode,
  ]);

  const selectedCategory = useMemo(
    () => categories.find((item) => String(item.id) === categoryId) ?? null,
    [categories, categoryId],
  );
  const legacyCategoryName = getAdminProductCategoryName(
    defaultValues?.category,
    "",
  );
  const categoryName =
    selectedCategory?.name ?? (!categoriesLoaded ? legacyCategoryName : "");
  const previewPrice = useMemo(() => formatCurrency(price), [price]);
  const primaryPreviewUrl = primaryItem?.previewUrl ?? "";
  const galleryCount = galleryItems.length;
  const isBusy = isSubmitting || isDeleting;
  const showVariantTable =
    hasVariants &&
    variants.length > 0 &&
    (options.length > 0 || variants.length > 1);
  const variantRowKeys = useMemo(
    () => variants.map((variant, index) => getVariantRowKey(variant, index)),
    [variants],
  );
  const allVariantsSelected =
    variantRowKeys.length > 0 &&
    variantRowKeys.every((key) => selectedVariantIds.includes(key));
  const totalInventory = useMemo(
    () => variants.reduce((sum, item) => sum + Number(item.stock || 0), 0),
    [variants],
  );

  useEffect(() => {
    variantImageFilesRef.current = variantImageFiles;
  }, [variantImageFiles]);

  useEffect(() => {
    return () => {
      Object.values(variantImageFilesRef.current).forEach((entry) => {
        URL.revokeObjectURL(entry.previewUrl);
      });
    };
  }, []);

  const variantImageFilePayload = useMemo(
    () =>
      Object.entries(variantImageFiles).map(([key, entry]) => ({
        key,
        file: entry.file,
      })),
    [variantImageFiles],
  );

  function clearVariantImageFiles() {
    setVariantImageFiles((current) => {
      Object.values(current).forEach((entry) => {
        URL.revokeObjectURL(entry.previewUrl);
      });

      return {};
    });
  }

  function handleDiscard() {
    setName(defaultValues?.name ?? "");
    setDescription(defaultValues?.description ?? "");
    setPrice(defaultValues?.price ?? "");
    setStock(defaultValues?.stock ?? 0);
    setCategoryId(resolveInitialCategoryId(defaultValues, categories, mode));
    setStatus((defaultValues?.status as Product["status"]) ?? "Active");
    setOptions(defaultValues?.options ?? []);
    setHasVariants(shouldShowVariantEditor(defaultValues));
    setVariants(
      normalizeIncomingVariants(
        defaultValues?.variants,
        String(defaultValues?.price ?? ""),
        defaultValues?.stock ?? 0,
        defaultValues?.image,
      ),
    );
    setTagsText((defaultValues?.tags ?? []).join(", "));
    setProductType(defaultValues?.productType ?? "");
    setVendor(defaultValues?.vendor ?? "");
    setSeoTitle(defaultValues?.seoTitle ?? "");
    setSeoDescription(defaultValues?.seoDescription ?? "");
    setEditingOptionIndex(null);
    setOptionDraft(null);
    setSelectedVariantIds([]);
    setBulkPrice("");
    setBulkStock("");
    clearVariantImageFiles();
    resetMedia();
  }

  function updateDefaultVariant(
    next: Partial<NonNullable<Product["variants"]>[number]>,
  ) {
    setVariants((current) =>
      current.map((variant, index) =>
        variant.isDefault || index === 0
          ? {
              ...variant,
              ...next,
              status:
                next.stock === 0
                  ? "OUT_OF_STOCK"
                  : next.stock !== undefined &&
                      variant.status === "OUT_OF_STOCK"
                    ? "ACTIVE"
                    : (next.status ?? variant.status),
            }
          : variant,
      ),
    );
  }

  function pruneVariantImageFiles(
    nextVariants: NonNullable<Product["variants"]>,
  ) {
    const activeKeys = new Set(
      nextVariants.map((variant, index) =>
        getVariantImageFileKey(variant, index),
      ),
    );

    setVariantImageFiles((current) => {
      const nextEntries: Record<string, VariantImageFileEntry> = {};

      for (const [key, entry] of Object.entries(current)) {
        if (activeKeys.has(key)) {
          nextEntries[key] = entry;
        } else {
          URL.revokeObjectURL(entry.previewUrl);
        }
      }

      return nextEntries;
    });
  }

  function syncVariantsFromOptions(
    nextOptions: NonNullable<Product["options"]>,
  ) {
    setSelectedVariantIds([]);

    setVariants((current) => {
      if (!nextOptions.length || !nextOptions[0].values.length) {
        const defaultVariant = current.find((v) => v.isDefault) ?? current[0];
        return defaultVariant
          ? [{ ...defaultVariant, isDefault: true, position: 0 }]
          : [createDefaultVariant(price, stock, primaryPreviewUrl)];
      }

      const firstOption = nextOptions[0];
      const optionValues = firstOption.values.map((v) => v.value);
      const newVariants = generateVariantsFromOption(
        optionValues,
        price,
        stock,
      );
      pruneVariantImageFiles(newVariants);
      return newVariants;
    });
  }

  function startAddOption() {
    setHasVariants(true);
    setEditingOptionIndex(null);
    setOptionDraft({ name: "", values: [""] });
  }

  function startEditOption(index: number) {
    const option = options[index];
    setEditingOptionIndex(index);
    setOptionDraft({
      name: option.name,
      values: option.values.length
        ? option.values.map((value) => value.value)
        : [""],
    });
  }

  function updateDraftValue(index: number, value: string) {
    setOptionDraft((current) =>
      current
        ? {
            ...current,
            values: current.values.map((item, itemIndex) =>
              itemIndex === index ? value : item,
            ),
          }
        : current,
    );
  }

  function addDraftValue() {
    setOptionDraft((current) =>
      current ? { ...current, values: [...current.values, ""] } : current,
    );
  }

  function removeDraftValue(index: number) {
    setOptionDraft((current) =>
      current
        ? {
            ...current,
            values:
              current.values.length > 1
                ? current.values.filter((_, itemIndex) => itemIndex !== index)
                : [""],
          }
        : current,
    );
  }

  function cancelOptionEdit() {
    if (!options.length) {
      setHasVariants(false);
    }

    setEditingOptionIndex(null);
    setOptionDraft(null);
  }

  function saveOptionDraft() {
    if (!optionDraft) return;

    const name = optionDraft.name.trim();
    const uniqueValues = Array.from(
      new Set(optionDraft.values.map((value) => value.trim()).filter(Boolean)),
    );

    if (!name || uniqueValues.length === 0) {
      toast.error("Add an option name and at least one value");
      return;
    }

    const nextOption = {
      name,
      position:
        editingOptionIndex === null ? options.length : editingOptionIndex,
      values: uniqueValues.map((value, index) => ({
        value,
        position: index,
      })),
    };
    const nextOptions =
      editingOptionIndex === null
        ? [...options, nextOption]
        : options.map((option, index) =>
            index === editingOptionIndex ? nextOption : option,
          );

    setOptions(nextOptions);
    syncVariantsFromOptions(nextOptions);
    setEditingOptionIndex(null);
    setOptionDraft(null);
  }

  function deleteEditingOption() {
    if (editingOptionIndex === null) {
      cancelOptionEdit();
      return;
    }

    const nextOptions = options
      .filter((_, index) => index !== editingOptionIndex)
      .map((option, position) => ({ ...option, position }));

    setOptions(nextOptions);
    if (!nextOptions.length) setHasVariants(false);
    syncVariantsFromOptions(nextOptions);
    setEditingOptionIndex(null);
    setOptionDraft(null);
  }

  function updateVariant(
    index: number,
    next: Partial<NonNullable<Product["variants"]>[number]>,
  ) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              ...next,
              status:
                next.stock === 0
                  ? "OUT_OF_STOCK"
                  : next.stock !== undefined &&
                      variant.status === "OUT_OF_STOCK"
                    ? "ACTIVE"
                    : (next.status ?? variant.status),
            }
          : variant,
      ),
    );
  }

  function toggleVariantSelection(key: string) {
    setSelectedVariantIds((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  function toggleSelectAll() {
    setSelectedVariantIds(allVariantsSelected ? [] : variantRowKeys);
  }

  function clearVariantSelection() {
    setSelectedVariantIds([]);
  }

  function updateVariantByKey(
    key: string,
    next: Partial<NonNullable<Product["variants"]>[number]>,
  ) {
    setVariants((current) =>
      current.map((variant, index) =>
        getVariantRowKey(variant, index) === key
          ? {
              ...variant,
              ...next,
              status:
                next.stock === 0
                  ? "OUT_OF_STOCK"
                  : next.stock !== undefined &&
                      variant.status === "OUT_OF_STOCK"
                    ? "ACTIVE"
                    : (next.status ?? variant.status),
            }
          : variant,
      ),
    );
  }

  function applyBulkPrice() {
    const value = Number(bulkPrice || 0);

    setVariants((current) =>
      current.map((variant, index) =>
        selectedVariantIds.includes(getVariantRowKey(variant, index))
          ? { ...variant, price: value }
          : variant,
      ),
    );
  }

  function applyBulkStock() {
    const value = Number(bulkStock || 0);

    setVariants((current) =>
      current.map((variant, index) =>
        selectedVariantIds.includes(getVariantRowKey(variant, index))
          ? {
              ...variant,
              stock: value,
              status:
                value === 0
                  ? "OUT_OF_STOCK"
                  : variant.status === "OUT_OF_STOCK"
                    ? "ACTIVE"
                    : variant.status,
            }
          : variant,
      ),
    );
  }

  function clearSelectedPrices() {
    setVariants((current) =>
      current.map((variant, index) =>
        selectedVariantIds.includes(getVariantRowKey(variant, index))
          ? { ...variant, price: 0 }
          : variant,
      ),
    );
  }

  function clearSelectedStocks() {
    setVariants((current) =>
      current.map((variant, index) =>
        selectedVariantIds.includes(getVariantRowKey(variant, index))
          ? { ...variant, stock: 0, status: "OUT_OF_STOCK" }
          : variant,
      ),
    );
  }

  function clearSelectedImages() {
    setVariantImageFiles((current) => {
      const nextEntries = { ...current };

      selectedVariantIds.forEach((key) => {
        if (nextEntries[key]) {
          URL.revokeObjectURL(nextEntries[key].previewUrl);
          delete nextEntries[key];
        }
      });

      return nextEntries;
    });
    setVariants((current) =>
      current.map((variant, index) =>
        selectedVariantIds.includes(getVariantRowKey(variant, index))
          ? { ...variant, image: null, imageFileKey: null }
          : variant,
      ),
    );
  }

  function setDefaultVariant(index: number) {
    setVariants((current) =>
      current.map((variant, variantIndex) => ({
        ...variant,
        isDefault: variantIndex === index,
      })),
    );
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        ...createDefaultVariant(price, stock, primaryPreviewUrl),
        title: "New variant",
        isDefault: current.length === 0,
        position: current.length,
      },
    ]);
  }

  function removeVariant(index: number) {
    clearVariantSelection();

    setVariants((current) => {
      const next = current
        .filter((_, variantIndex) => variantIndex !== index)
        .map((variant, position) => ({ ...variant, position }));

      if (!next.length) {
        const fallback = [
          createDefaultVariant(price, stock, primaryPreviewUrl),
        ];
        pruneVariantImageFiles(fallback);
        return fallback;
      }
      if (!next.some((variant) => variant.isDefault)) next[0].isDefault = true;

      pruneVariantImageFiles(next);
      return next;
    });
  }

  function handleVariantImageUpload(index: number, file: File) {
    const variant = variants[index];
    if (!variant) return;

    const key = getVariantImageFileKey(variant, index);
    const previewUrl = URL.createObjectURL(file);

    setVariantImageFiles((current) => {
      if (current[key]) {
        URL.revokeObjectURL(current[key].previewUrl);
      }

      return {
        ...current,
        [key]: { file, previewUrl },
      };
    });
    updateVariant(index, {
      image: previewUrl,
      imageFileKey: key,
    });
  }

  function getVariantImagePreview(
    variant: NonNullable<Product["variants"]>[number],
    index: number,
  ) {
    const key = getVariantImageFileKey(variant, index);
    return variantImageFiles[key]?.previewUrl ?? variant.image ?? "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasPrimary) {
      toast.error("Upload at least one product image");
      return;
    }

    if (!selectedCategory) {
      toast.error("Select a valid product category");
      return;
    }

    const values: ProductFormValues = {
      name,
      category: selectedCategory.name,
      categoryId: selectedCategory.id,
      price: String(price || ""),
      stock: Number(stock || 0),
      status,
      description,
      image: primaryExistingImage || undefined,
      primaryImageFile,
      galleryFiles,
      existingGalleryImages,
      options,
      variants: variants.map((variant, index) => ({
        ...variant,
        title: variant.title || "Variant",
        price: Number(variant.price || 0),
        stock: Number(variant.stock || 0),
        position: index,
        imageFileKey:
          variant.imageFileKey ?? getVariantImageFileKey(variant, index),
        isDefault: variants.some((candidate) => candidate.isDefault)
          ? variant.isDefault
          : index === 0,
      })),
      tags: tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      productType,
      vendor,
      seoTitle,
      seoDescription,
      variantImageFiles: variantImageFilePayload,
    };

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;

    setIsDeleting(true);

    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="category" value={categoryName} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="status" value={status} />

      <ProductEditorHeader
        mode={mode}
        name={name}
        category={categoryName}
        status={status}
        hasPrimaryImage={hasPrimary}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        onDiscard={() => setDiscardDialogOpen(true)}
        onDelete={onDelete ? () => setDeleteDialogOpen(true) : undefined}
      />

      <ConfirmActionDialog
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        title="Discard changes?"
        description="Unsaved edits will be lost."
        confirmLabel="Discard changes"
        disabled={isBusy}
        onConfirm={handleDiscard}
      />

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete "${name.trim() || "product"}"?`}
        description="This cannot be undone."
        confirmLabel={isDeleting ? "Deleting..." : "Delete product"}
        disabled={isDeleting}
        variant="destructive"
        onConfirm={handleDelete}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <ProductEditorCard>
            <ProductEditorField htmlFor="name" label="Title">
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Velvet Glow Lip Tint"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-10 rounded-lg px-3.5 text-sm font-medium"
                disabled={isBusy}
              />
            </ProductEditorField>

            <ProductEditorField htmlFor="description" label="Description">
              <Textarea
                id="description"
                name="description"
                placeholder="Write a concise, useful description for shoppers and operators."
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-28 rounded-lg px-3.5 py-2.5 text-sm leading-6"
                disabled={isBusy}
              />
            </ProductEditorField>

            <div className="rounded-lg border border-transparent py-1.5">
              <ProductMediaSection
                items={mediaItems}
                primaryItem={primaryItem}
                galleryCount={galleryCount}
                disabled={isBusy}
                errorMessage={dropzoneError}
                onFilesAccepted={acceptFiles}
                onError={reportDropzoneError}
                onMakePrimary={setPrimary}
                onMoveLeft={(id) => moveItem(id, "left")}
                onMoveRight={(id) => moveItem(id, "right")}
                onRemove={removeItem}
                onReplacePrimary={replacePrimary}
              />
            </div>

            <div className="rounded-lg border border-transparent py-1.5">
              <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
                <ProductEditorField
                  label="Category"
                  helper="Category helps shoppers browse and keeps the catalog organized."
                >
                  <div className="relative">
                    <FolderKanban className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Select
                      value={categoryId}
                      onValueChange={(value) => setCategoryId(value)}
                      disabled={isBusy}
                    >
                      <SelectTrigger className="h-11 rounded-xl pl-9">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {categoriesError ? (
                    <p className="text-xs leading-5 text-[color:var(--destructive)]">
                      {categoriesError}
                    </p>
                  ) : null}
                </ProductEditorField>

                <ProductEditorField label="Price">
                  <div className="space-y-2.5">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                        Rs
                      </span>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min={0}
                        required
                        placeholder="0.00"
                        value={price}
                        onChange={(event) => {
                          setPrice(event.target.value);
                          updateDefaultVariant({
                            price: Number(event.target.value || 0),
                          });
                        }}
                        className="h-11 rounded-xl pl-11"
                        disabled={isBusy}
                      />
                    </div>
                  </div>
                </ProductEditorField>

                <ProductEditorField label="Available units">
                  <div className="space-y-2.5">
                    <div className="relative">
                      <Boxes className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={String(stock)}
                        onChange={(event) => {
                          const nextStock = Number(event.target.value || 0);
                          setStock(nextStock);
                          updateDefaultVariant({ stock: nextStock });
                        }}
                        className="h-11 rounded-xl pl-10"
                        disabled={isBusy}
                      />
                    </div>
                  </div>
                </ProductEditorField>
              </div>
            </div>
          </ProductEditorCard>

          <ProductEditorCard
            title="Variants"
            description="Add options like size or color."
          >
            {!hasVariants ? (
              <button
                type="button"
                onClick={startAddOption}
                disabled={isBusy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/35 px-4 py-6 text-sm font-medium text-muted-foreground transition hover:border-primary/70 hover:bg-muted/60 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="size-4" />
                Add options like size or color
              </button>
            ) : (
              <div className="space-y-4">
                {!optionDraft ? (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={startAddOption}
                      disabled={isBusy}
                    >
                      <Plus className="size-4" />
                      Add option
                    </Button>
                  </div>
                ) : null}

                {!optionDraft && options.length > 0 ? (
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <button
                        key={`${option.name}-${index}`}
                        type="button"
                        onClick={() => startEditOption(index)}
                        disabled={isBusy}
                        className="flex w-full items-start justify-between gap-3 rounded-xl border border-border bg-white px-3 py-3 text-left shadow-sm transition hover:bg-muted/35 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {option.name}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {option.values.map((value) => (
                              <span
                                key={value.value}
                                className="rounded-full border border-border bg-muted/55 px-2.5 py-1 text-xs font-medium text-foreground"
                              >
                                {value.value}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Pencil className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                ) : null}

                {optionDraft ? (
                  <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label className="text-xs font-medium">
                          Option name
                        </Label>
                        <Input
                          value={optionDraft.name}
                          placeholder="Shade"
                          onChange={(event) =>
                            setOptionDraft((current) =>
                              current
                                ? { ...current, name: event.target.value }
                                : current,
                            )
                          }
                          disabled={isBusy}
                          className="h-10"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label className="text-xs font-medium">Values</Label>
                        <div className="space-y-2">
                          {optionDraft.values.map((value, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <Input
                                value={value}
                                placeholder={
                                  index === 0
                                    ? "Pink"
                                    : index === 1
                                      ? "Red"
                                      : "Black"
                                }
                                onChange={(event) =>
                                  updateDraftValue(index, event.target.value)
                                }
                                disabled={isBusy}
                                className="h-9"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeDraftValue(index)}
                                disabled={isBusy}
                                aria-label="Remove value"
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addDraftValue}
                          disabled={isBusy}
                          className="w-fit"
                        >
                          <Plus className="size-4" />
                          Add value
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={deleteEditingOption}
                        disabled={isBusy}
                      >
                        <Trash2 className="size-4" />
                        Delete option
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelOptionEdit}
                          disabled={isBusy}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={saveOptionDraft}
                          disabled={isBusy}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {showVariantTable ? (
                  <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b bg-muted/35 px-4 py-3">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Variants
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {variants.length} variant
                          {variants.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addVariant}
                        disabled={isBusy}
                      >
                        <Plus className="size-4" />
                        Add custom variant
                      </Button>
                    </div>
                    <div className="p-4">
                      {selectedVariantIds.length > 0 ? (
                        <div className="mb-4 rounded-xl border border-border bg-muted/45 p-4">
                          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                            <div className="text-sm font-medium text-foreground">
                              {selectedVariantIds.length} variant
                              {selectedVariantIds.length === 1 ? "" : "s"}{" "}
                              selected
                            </div>

                            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                  Bulk price
                                </Label>
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                      Rs
                                    </span>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={bulkPrice}
                                      onChange={(event) =>
                                        setBulkPrice(event.target.value)
                                      }
                                      placeholder="0.00"
                                      className="h-9 w-28 rounded-xl pl-9"
                                      disabled={isBusy}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={applyBulkPrice}
                                    disabled={isBusy}
                                    className="h-9"
                                  >
                                    Apply
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">
                                  Bulk stock
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min={0}
                                    value={bulkStock}
                                    onChange={(event) =>
                                      setBulkStock(event.target.value)
                                    }
                                    placeholder="0"
                                    className="h-9 w-24 rounded-xl"
                                    disabled={isBusy}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={applyBulkStock}
                                    disabled={isBusy}
                                    className="h-9"
                                  >
                                    Apply
                                  </Button>
                                </div>
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearSelectedPrices}
                                disabled={isBusy}
                                className="h-9"
                              >
                                Clear price
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearSelectedStocks}
                                disabled={isBusy}
                                className="h-9"
                              >
                                Clear stock
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearSelectedImages}
                                disabled={isBusy}
                                className="h-9"
                              >
                                Remove image
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearVariantSelection}
                                disabled={isBusy}
                                className="h-9"
                              >
                                Clear selection
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="overflow-x-auto">
                        <div className="min-w-[860px] overflow-hidden rounded-xl border border-border bg-white">
                          <div className="grid grid-cols-[44px_minmax(280px,1fr)_170px_140px_180px] items-center gap-3 border-b bg-muted/35 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <div>
                              <input
                                type="checkbox"
                                checked={allVariantsSelected}
                                onChange={toggleSelectAll}
                                disabled={isBusy}
                                className="size-4 rounded border-border"
                                aria-label="Select all variants"
                              />
                            </div>
                            <div>Variant</div>
                            <div>Price</div>
                            <div>Available</div>
                            <div className="text-right">Actions</div>
                          </div>

                          <div className="divide-y divide-border">
                            {variants.map((variant, index) => {
                              const variantKey = getVariantRowKey(
                                variant,
                                index,
                              );
                              const variantImagePreview =
                                getVariantImagePreview(variant, index);

                              return (
                                <div
                                  key={variantKey}
                                  className="grid min-h-16 grid-cols-[44px_minmax(280px,1fr)_170px_140px_180px] items-center gap-3 px-4 py-3 transition hover:bg-muted/25"
                                >
                                  <div>
                                    <input
                                      type="checkbox"
                                      checked={selectedVariantIds.includes(
                                        variantKey,
                                      )}
                                      onChange={() =>
                                        toggleVariantSelection(variantKey)
                                      }
                                      disabled={isBusy}
                                      className="size-4 rounded border-border"
                                      aria-label={`Select ${variant.title || "variant"}`}
                                    />
                                  </div>

                                  <div className="flex min-w-0 items-center gap-3">
                                    <label className="group flex size-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40 transition hover:border-primary/45 hover:bg-muted/60">
                                      {variantImagePreview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={variantImagePreview}
                                          alt={variant.title || "Variant"}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-[0.7rem] font-medium text-muted-foreground group-hover:text-foreground">
                                          Upload
                                        </span>
                                      )}

                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={isBusy}
                                        onChange={(event) => {
                                          const file = event.target.files?.[0];
                                          if (file) {
                                            handleVariantImageUpload(
                                              index,
                                              file,
                                            );
                                          }
                                          event.target.value = "";
                                        }}
                                      />
                                    </label>

                                    <div className="min-w-0 flex-1">
                                      <Input
                                        value={variant.title}
                                        placeholder="Variant name"
                                        onChange={(event) =>
                                          updateVariantByKey(variantKey, {
                                            title: event.target.value,
                                          })
                                        }
                                        disabled={isBusy}
                                        className="h-9 min-w-0"
                                      />
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        Variant option
                                      </p>
                                    </div>
                                  </div>

                                  <div className="relative w-40">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                      Rs
                                    </span>

                                    <Input
                                      type="number"
                                      min={0}
                                      value={String(variant.price)}
                                      onChange={(event) =>
                                        updateVariantByKey(variantKey, {
                                          price: Number(
                                            event.target.value || 0,
                                          ),
                                        })
                                      }
                                      className="h-10 rounded-xl pl-10 pr-3 text-sm"
                                      disabled={isBusy}
                                    />
                                  </div>

                                  <Input
                                    type="number"
                                    min={0}
                                    value={String(variant.stock)}
                                    onChange={(event) =>
                                      updateVariantByKey(variantKey, {
                                        stock: Number(event.target.value || 0),
                                      })
                                    }
                                    className="h-10 w-28 rounded-xl px-3 text-sm"
                                    disabled={isBusy}
                                  />

                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setDefaultVariant(index)}
                                      disabled={isBusy || variant.isDefault}
                                      aria-label={
                                        variant.isDefault
                                          ? "Default variant"
                                          : "Set as default variant"
                                      }
                                      className={`h-9 min-w-24 px-3 text-xs ${
                                        variant.isDefault
                                          ? "border-primary/25 bg-primary/10 text-primary"
                                          : ""
                                      }`}
                                    >
                                      {variant.isDefault
                                        ? "Default"
                                        : "Set default"}
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeVariant(index)}
                                      disabled={isBusy || variants.length === 1}
                                      aria-label="Remove variant"
                                      className="size-9"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
                        <span>
                          Total variants:{" "}
                          <span className="font-medium text-foreground">
                            {variants.length}
                          </span>
                        </span>
                        <span>
                          Total inventory:{" "}
                          <span className="font-medium text-foreground">
                            {totalInventory}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </ProductEditorCard>
        </div>

        <div className="self-start space-y-6 xl:sticky xl:top-28">
          <ProductSummaryCard
            mode={mode}
            name={name}
            category={categoryName}
            priceLabel={previewPrice}
            stock={stock}
            primaryPreviewUrl={primaryPreviewUrl}
            galleryCount={galleryCount}
          />

          <ProductSidebarCard
            title="Product settings"
            description="Workspace-only controls and save context."
          >
            <div className="space-y-4">
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="vendor" className="text-[0.8rem]">
                    Vendor
                  </Label>
                  <Input
                    id="vendor"
                    value={vendor}
                    placeholder="Kittik Beauty"
                    onChange={(event) => setVendor(event.target.value)}
                    disabled={isBusy}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productType" className="text-[0.8rem]">
                    Product type
                  </Label>
                  <Input
                    id="productType"
                    value={productType}
                    placeholder="Serum, lipstick, cream"
                    onChange={(event) => setProductType(event.target.value)}
                    disabled={isBusy}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags" className="text-[0.8rem]">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={tagsText}
                    placeholder="hydrating, daily care"
                    onChange={(event) => setTagsText(event.target.value)}
                    disabled={isBusy}
                  />
                </div>
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
                        Product status controls whether the catalog item is
                        draft, active, or archived. Inventory status is managed
                        per variant.
                      </p>
                    </div>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setStatus(value as Product["status"])
                      }
                      disabled={isBusy}
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
                      Product details, media, options, variants, and SEO fields
                      are saved together.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="seoTitle" className="text-[0.8rem]">
                    SEO title
                  </Label>
                  <Input
                    id="seoTitle"
                    value={seoTitle}
                    onChange={(event) => setSeoTitle(event.target.value)}
                    disabled={isBusy}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="seoDescription" className="text-[0.8rem]">
                    SEO description
                  </Label>
                  <Textarea
                    id="seoDescription"
                    rows={3}
                    value={seoDescription}
                    onChange={(event) => setSeoDescription(event.target.value)}
                    disabled={isBusy}
                  />
                </div>
              </div>
            </div>
          </ProductSidebarCard>
        </div>
      </div>
    </form>
  );
}
