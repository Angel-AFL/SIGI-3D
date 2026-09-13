"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export function useClientValue<T>(getSnapshot: () => T, serverSnapshot: T): T {
  return useSyncExternalStore(noopSubscribe, getSnapshot, () => serverSnapshot);
}
