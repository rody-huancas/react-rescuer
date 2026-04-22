import { useContext } from "react";
import { ErrorContextContext } from "../core/context";
import type { ErrorContext } from "../core/types";

export function useErrorContext(): ErrorContext {
  const ctx = useContext(ErrorContextContext);
  if (!ctx) {
    throw new Error("useErrorContext must be used within an ErrorBoundary fallback");
  }
  return ctx;
}
