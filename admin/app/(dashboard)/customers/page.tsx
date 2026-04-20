"use client";

import DataTable from "@/components/shared/DataTable";
import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import StatusPill from "@/components/shared/StatusPill";
import { getUsers, type AdminApiUser } from "@/lib/api";
import { formatShortDate } from "@/lib/format";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function CustomersPage() {
  const [users, setUsers] = useState<AdminApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadUsers() {
      try {
        const data = await getUsers();
        if (!cancelled) setUsers(data);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load users.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  const columns = useMemo<ColumnDef<AdminApiUser, unknown>[]>(
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
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-[0.72rem] font-semibold text-primary">
              {initialsOf(row.original.name)}
            </div>
            <span className="text-sm font-medium text-foreground">
              {row.original.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="font-mono text-[0.78rem] text-muted-foreground">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const isAdmin = row.original.role?.toLowerCase() === "admin";
          return (
            <StatusPill
              label={row.original.role}
              tone={isAdmin ? "accent" : "neutral"}
            />
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => (
          <span className="font-mono text-[0.72rem] text-muted-foreground">
            {formatShortDate(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Customers"
        title="People"
        description="Directory of registered users and operators."
      />

      {errorMessage ? <Notice tone="danger" message={errorMessage} /> : null}

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        emptyLabel="No customers registered yet."
      />
    </div>
  );
}
