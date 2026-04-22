"use client";
/* eslint-disable @next/next/no-img-element */

import DataTable from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import type { AdminApiReel } from "@/lib/api";
import { formatNumber, formatRelativeTime } from "@/lib/format";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpRight,
  Eye,
  Heart,
  MousePointerClick,
  Share2,
} from "lucide-react";
import { useMemo } from "react";

function statusVariant(
  status: AdminApiReel["status"],
): "default" | "destructive" | "secondary" {
  if (status === "ACTIVE") return "default";
  if (status === "ARCHIVED") return "destructive";
  return "secondary";
}

export default function ReelsTable({
  loading = false,
  reels,
}: {
  loading?: boolean;
  reels: AdminApiReel[];
}) {
  const columns = useMemo<ColumnDef<AdminApiReel, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-[0.78rem] text-muted-foreground">
            #{String(row.original.id).padStart(4, "0")}
          </span>
        ),
      },
      {
        accessorKey: "title",
        header: "Reel",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-secondary">
              {row.original.thumbnailUrl ? (
                <img
                  src={row.original.thumbnailUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : row.original.videoUrl ? (
                <video
                  src={row.original.videoUrl}
                  className="size-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <span className="font-mono text-[0.62rem] text-muted-foreground">
                  --
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                {row.original.title}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.caption || "No caption"}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(row.original.status)}>
              {row.original.status}
            </Badge>
            {row.original.featured ? (
              <Badge variant="outline">Featured</Badge>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "viewCount",
        header: "Views",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 font-mono tabular">
            <Eye className="size-3.5 text-muted-foreground" />
            {formatNumber(row.original.viewCount)}
          </span>
        ),
      },
      {
        id: "engagement",
        header: "Engagement",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="grid gap-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Heart className="size-3.5" />
              {formatNumber(row.original.likeCount)} likes /{" "}
              {formatNumber(row.original.saveCount)} saves
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Share2 className="size-3.5" />
              {formatNumber(row.original.shareCount)} shares /{" "}
              <MousePointerClick className="size-3.5" />
              {formatNumber(row.original.productClickCount)} clicks
            </span>
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: () => (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100">
            Edit
            <ArrowUpRight className="size-3" strokeWidth={2} />
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <DataTable
      data={reels}
      columns={columns}
      loading={loading}
      getRowHref={(row) => `/reels/${row.id}`}
      emptyLabel="No reels have been created yet."
    />
  );
}
