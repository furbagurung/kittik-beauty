import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ProductEditorHeaderProps = {
  mode: "create" | "edit";
  name: string;
  category: string;
  status: string;
  hasPrimaryImage: boolean;
  isSubmitting: boolean;
  isDeleting?: boolean;
  onDiscard: () => void;
  onDelete?: () => void;
};

export default function ProductEditorHeader({
  mode,
  name,
  isSubmitting,
  isDeleting = false,
  onDiscard,
  onDelete,
}: ProductEditorHeaderProps) {
  const heading =
    name.trim() || (mode === "create" ? "Create product" : "Edit product");
  const isBusy = isSubmitting || isDeleting;

  return (
    <div className="sticky top-4 z-20 rounded-2xl px-5 py-4">
      <div className="flex flex-col gap- 4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="space-y-1">
            <h1 className="text-[1.55rem] font-semibold tracking-[-0.03em] text-foreground md:text-[1.85rem]">
              {heading}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start">
          <Button
            type="button"
            variant="outline"
            onClick={onDiscard}
            disabled={isBusy}
          >
            Discard
          </Button>
          {mode === "edit" && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isBusy}
            >
              <Trash2 className="size-4" strokeWidth={2} />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          ) : null}
          <Button type="submit" disabled={isBusy}>
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Save product"
                : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
