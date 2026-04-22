import * as React from "react";

import type { ErrorContext } from "./types";

const GLOBAL_KEY = "__react_rescuer_error_context__";

type GlobalStore = {
  ErrorContextContext: React.Context<ErrorContext | null>;
};

function getGlobalStore(): GlobalStore {
  const g        = globalThis as unknown as Record<string, unknown>;
  const existing = g[GLOBAL_KEY];

  if (existing && typeof existing === "object") {
    const store = existing as Record<string, unknown>;
    const ctx   = store.ErrorContextContext;

    if (ctx && typeof ctx === "object") {
      return store as unknown as GlobalStore;
    }
  }

  const created: GlobalStore = {
    ErrorContextContext: React.createContext<ErrorContext | null>(null),
  };
  
  g[GLOBAL_KEY] = created as unknown;
  return created;
}

export const ErrorContextContext = getGlobalStore().ErrorContextContext;
