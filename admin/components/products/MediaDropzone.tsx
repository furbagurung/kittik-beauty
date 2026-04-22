"use client";

import { cn } from "@/lib/utils";
import { ImagePlus, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";

type MediaDropzoneProps = {
  disabled?: boolean;
  onFilesAccepted: (files: File[]) => void;
  onError?: (message: string) => void;
  maxFiles: number;
  currentCount: number;
  errorMessage?: string;
  variant?: "compact" | "tile";
  className?: string;
  hideMeta?: boolean;
  hideError?: boolean;
};

export default function MediaDropzone({
  disabled,
  onFilesAccepted,
  onError,
  maxFiles,
  currentCount,
  errorMessage,
  variant = "compact",
  className,
  hideMeta,
  hideError,
}: MediaDropzoneProps) {
  const remainingSlots = Math.max(0, maxFiles - currentCount);

  const { getInputProps, getRootProps, isDragActive, isDragReject, open } =
    useDropzone({
      accept: {
        "image/*": [],
      },
      disabled,
      maxFiles: remainingSlots || 1,
      maxSize: 5 * 1024 * 1024,
      multiple: true,
      noClick: true,
      onDropAccepted: onFilesAccepted,
      onDropRejected: (rejections) => {
        const firstError = rejections[0]?.errors[0];

        if (!firstError || !onError) {
          return;
        }

        if (firstError.code === "file-invalid-type") {
          onError("Only image files can be uploaded here.");
          return;
        }

        if (firstError.code === "file-too-large") {
          onError("Each image must be 5 MB or smaller.");
          return;
        }

        if (firstError.code === "too-many-files") {
          onError(`You can upload up to ${maxFiles} images.`);
          return;
        }

        onError("Some files could not be added. Please review the upload requirements.");
      },
    });

  if (variant === "tile") {
    return (
      <div className={cn("space-y-1.5", className)}>
        <div
          {...getRootProps()}
          className={cn(
            "group flex aspect-square min-h-24 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-3 text-center transition",
            "hover:border-primary/40 hover:bg-accent/50 focus-visible:border-primary/45 focus-visible:ring-4 focus-visible:ring-ring/10",
            isDragActive && "border-primary bg-accent/70",
            isDragReject && "border-destructive/50 bg-destructive/5",
            (disabled || remainingSlots === 0) && "cursor-not-allowed opacity-60",
          )}
          role="button"
          tabIndex={disabled || remainingSlots === 0 ? -1 : 0}
          onKeyDown={(event) => {
            if (
              (event.key === "Enter" || event.key === " ") &&
              !disabled &&
              remainingSlots > 0
            ) {
              event.preventDefault();
              open();
            }
          }}
        >
          <input {...getInputProps()} />
          <ImagePlus className="size-4 text-muted-foreground transition group-hover:text-primary" />
          <button
            type="button"
            onClick={open}
            disabled={disabled || remainingSlots === 0}
            className="mt-1.5 text-xs font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none"
          >
            Add media
          </button>
        </div>

        {!hideMeta ? (
          <div className="text-center text-[0.7rem] text-muted-foreground">
            {currentCount}/{maxFiles} images
          </div>
        ) : null}

        {errorMessage && !hideError ? (
          <div className="rounded-lg border border-destructive/25 bg-destructive/6 px-3 py-2 text-xs text-[color:var(--destructive)]">
            {errorMessage}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "group relative overflow-hidden rounded-lg border border-dashed px-4 py-5 transition-all duration-200",
          "bg-muted/35 hover:bg-accent/50 hover:border-primary/35",
          "focus-visible:border-primary/45 focus-visible:ring-4 focus-visible:ring-ring/10",
          isDragActive && "border-primary bg-accent/70",
          isDragReject && "border-destructive/50 bg-destructive/5",
          disabled && "cursor-not-allowed opacity-70",
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !disabled) {
            event.preventDefault();
            open();
          }
        }}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center text-center">
          <span
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-md border border-border/70 bg-card text-primary transition-transform duration-200",
              isDragActive && "scale-[1.03]",
            )}
          >
            {isDragActive ? (
              <UploadCloud className="size-4" strokeWidth={1.8} />
            ) : (
              <ImagePlus className="size-4" strokeWidth={1.8} />
            )}
          </span>

          <h3 className="mt-2.5 text-sm font-medium text-foreground">
            {isDragActive ? "Drop images to add them" : "Add product media"}
          </h3>
          <p className="mt-0.5 max-w-lg text-xs leading-5 text-muted-foreground">
            Drag images here or upload new files.
          </p>

          <button
            type="button"
            onClick={open}
            disabled={disabled || remainingSlots === 0}
            className="mt-3 inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10"
          >
            Upload new
          </button>
        </div>
      </div>

      {!hideMeta ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>PNG, JPG, WEBP, or GIF up to 5 MB each.</span>
          <span>
            {currentCount}/{maxFiles} images
          </span>
        </div>
      ) : null}

      {errorMessage && !hideError ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/6 px-3.5 py-2.5 text-sm text-[color:var(--destructive)]">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
