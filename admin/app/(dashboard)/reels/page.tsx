"use client";

import ReelsTable from "@/components/reels/ReelsTable";
import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getReels, type AdminApiReel } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ReelsPage() {
  const [reels, setReels] = useState<AdminApiReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReels() {
      try {
        const data = await getReels();
        if (!cancelled) {
          setReels(data);
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setReels([]);
          setErrorMessage(getErrorMessage(error, "Failed to load reels"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReels();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Catalog"
        title="Reels"
        description="Manage shoppable video content, publishing status, and engagement signals."
        action={
          <Button asChild>
            <Link href="/reels/new">
              <Plus className="size-4" strokeWidth={2} />
              New reel
            </Link>
          </Button>
        }
      />

      {errorMessage ? <Notice tone="danger" message={errorMessage} /> : null}

      <ReelsTable reels={reels} loading={loading} />
    </div>
  );
}
