"use client";

/* eslint-disable @next/next/no-img-element */

import ConfirmActionDialog from "@/components/shared/ConfirmActionDialog";
import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createBanner,
  deleteBanner,
  getBanners,
  type AdminApiBanner,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import {
  ExternalLink,
  ImagePlus,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type BannerFormState = {
  title: string;
  subtitle: string;
  cta: string;
  link: string;
  order: string;
};

const emptyForm: BannerFormState = {
  title: "",
  subtitle: "",
  cta: "",
  link: "",
  order: "0",
};

function sortBanners(banners: AdminApiBanner[]) {
  return [...banners].sort((left, right) => {
    if (left.order !== right.order) return left.order - right.order;
    return right.createdAt.localeCompare(left.createdAt);
  });
}

function getBannerLabel(banner: AdminApiBanner) {
  return banner.title || banner.subtitle || `Banner #${banner.id}`;
}

function parseOrder(value: string) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function BannersPage() {
  const [banners, setBanners] = useState<AdminApiBanner[]>([]);
  const [form, setForm] = useState<BannerFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminApiBanner | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);

  const sortedBanners = useMemo(() => sortBanners(banners), [banners]);

  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBanners();
      setBanners(sortBanners(data));
      setErrorMessage("");
    } catch (error) {
      setBanners([]);
      setErrorMessage(getErrorMessage(error, "Failed to load hero banners."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialBanners() {
      try {
        const data = await getBanners();

        if (!cancelled) {
          setBanners(sortBanners(data));
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setBanners([]);
          setErrorMessage(
            getErrorMessage(error, "Failed to load hero banners."),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialBanners();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function updateForm<Key extends keyof BannerFormState>(
    key: Key,
    value: BannerFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      setImageFile(file);
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(file);
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!imageFile) {
      setErrorMessage("Banner image file is required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      await createBanner(
        {
          title: form.title.trim() || undefined,
          subtitle: form.subtitle.trim() || undefined,
          cta: form.cta.trim() || undefined,
          link: form.link.trim() || undefined,
          order: parseOrder(form.order),
        },
        imageFile,
      );
      setForm(emptyForm);
      setImageFile(null);
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
      setFileInputKey((current) => current + 1);
      await loadBanners();
      toast.success("Banner created");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to create banner.");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setErrorMessage("");
      await deleteBanner(deleteTarget.id);
      await loadBanners();
      setDeleteTarget(null);
      toast.success("Banner deleted");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to delete banner.");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        kicker="Content"
        title="Hero banners"
        description="Manage the dynamic promotional banners shown in the storefront hero area."
      />

      {errorMessage ? <Notice tone="danger" message={errorMessage} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Create hero banner</CardTitle>
          <CardDescription>
            Upload a hero image and add optional copy for the storefront.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="bannerImage">Banner image</Label>
                  <Input
                    key={fileInputKey}
                    id="bannerImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bannerTitle">Title</Label>
                  <Input
                    id="bannerTitle"
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    placeholder="Summer skin edit"
                    disabled={saving}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bannerSubtitle">Subtitle</Label>
                  <Input
                    id="bannerSubtitle"
                    value={form.subtitle}
                    onChange={(event) =>
                      updateForm("subtitle", event.target.value)
                    }
                    placeholder="Fresh arrivals for daily routines"
                    disabled={saving}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bannerCta">CTA text</Label>
                  <Input
                    id="bannerCta"
                    value={form.cta}
                    onChange={(event) => updateForm("cta", event.target.value)}
                    placeholder="Shop now"
                    disabled={saving}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bannerLink">Link</Label>
                  <Input
                    id="bannerLink"
                    value={form.link}
                    onChange={(event) => updateForm("link", event.target.value)}
                    placeholder="/products"
                    disabled={saving}
                  />
                </div>

                <div className="grid gap-2 md:max-w-48">
                  <Label htmlFor="bannerOrder">Order number</Label>
                  <Input
                    id="bannerOrder"
                    type="number"
                    value={form.order}
                    onChange={(event) => updateForm("order", event.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="media-stage-accent flex min-h-[250px] flex-col justify-between overflow-hidden rounded-xl border border-hairline">
                {preview ? (
                  <img
                    src={preview}
                    alt="Hero banner preview"
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center px-6 text-center text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <ImagePlus className="size-8" strokeWidth={1.6} />
                      <span>Image preview appears here</span>
                    </div>
                  </div>
                )}

                <div className="border-t border-hairline bg-card/90 px-4 py-3">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {form.title.trim() || "Untitled banner"}
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    {form.subtitle.trim() || "Subtitle preview"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Plus className="size-4" strokeWidth={2} />
                Create banner
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All hero banners</CardTitle>
          <CardDescription>
            Banners are displayed by ascending order number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} size="sm">
                  <div className="h-40 bg-muted" />
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <div className="h-3.5 w-2/3 rounded-full bg-muted" />
                      <div className="h-3 w-1/2 rounded-full bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedBanners.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sortedBanners.map((banner) => (
                <Card key={banner.id} size="sm">
                  <div className="relative h-44 overflow-hidden bg-muted">
                    <img
                      src={banner.image}
                      alt={getBannerLabel(banner)}
                      className="h-full w-full object-cover transition duration-200 group-hover/card:scale-[1.02]"
                    />
                    <div className="absolute left-3 top-3 flex gap-2">
                      <Badge variant={banner.isActive ? "default" : "secondary"}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">Order {banner.order}</Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="truncate">
                      {getBannerLabel(banner)}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {banner.subtitle || "No subtitle"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                      <div className="truncate">
                        CTA:{" "}
                        <span className="font-medium text-foreground">
                          {banner.cta || "None"}
                        </span>
                      </div>
                      <div className="truncate">
                        Link:{" "}
                        {banner.link ? (
                          <span className="font-medium text-foreground">
                            {banner.link}
                          </span>
                        ) : (
                          <span>None</span>
                        )}
                      </div>
                      <div>Created {formatDate(banner.createdAt)}</div>
                    </div>
                  </CardContent>

                  <CardFooter className="justify-between gap-3">
                    {banner.link ? (
                      <Button asChild type="button" variant="outline" size="sm">
                        <a
                          href={banner.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="size-3.5" />
                          Open
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No link
                      </span>
                    )}

                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(banner)}
                      disabled={deleting}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-hairline bg-secondary/45 px-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <ImagePlus className="size-8 text-muted-foreground" />
                <div className="text-sm font-medium text-foreground">
                  No hero banners yet
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete "${deleteTarget ? getBannerLabel(deleteTarget) : "banner"}"?`}
        description="This removes the hero banner from the storefront rotation."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        disabled={deleting}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
