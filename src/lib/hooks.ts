"use client";

import { useSyncExternalStore } from "react";

/** True once hydrated on the client (false during SSR / first paint). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** The page origin on the client; empty string while server-rendering. */
export function useOrigin(): string {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
}
