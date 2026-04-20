"use client";

import { useSyncExternalStore } from "react";
import {
  getServerAdminSessionSnapshot,
  readAdminSessionSnapshot,
  subscribeAdminSession,
} from "@/lib/admin-session";

export function useAdminSession() {
  return useSyncExternalStore(
    subscribeAdminSession,
    readAdminSessionSnapshot,
    getServerAdminSessionSnapshot,
  );
}
