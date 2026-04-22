"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

type ProductSuccessToastProps = {
  success?: string;
};

const successMessages: Record<string, { message: string; type: "success" | "info" }> = {
  created: { message: "Product created", type: "success" },
  deleted: { message: "Product deleted", type: "success" },
  updated: { message: "Product updated", type: "info" },
};

export default function ProductSuccessToast({
  success,
}: ProductSuccessToastProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!success) return;

    const config = successMessages[success];
    if (!config) return;

    toast[config.type](config.message);
    router.replace(pathname, { scroll: false });
  }, [pathname, router, success]);

  return null;
}
