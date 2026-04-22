import type { ErrorContext } from "../core/types";

type BoundaryResult = {
  getLastError  : () => Error | null;
  getLastContext: () => ErrorContext | null;
};

function isBoundaryResult(value: unknown): value is BoundaryResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v.getLastError === "function" &&
    typeof v.getLastContext === "function"
  );
}

export const matchers = {
  toHaveCaughtError(this: unknown, received: unknown) {
    if (!isBoundaryResult(received)) {
      return {
        pass   : false,
        message: () => "Expected result from createTestBoundary()",
      };
    }
    const err  = received.getLastError();
    const pass = err instanceof Error;

    return {
      pass,
      message: () => pass ? "Expected boundary not to have caught an error" : "Expected boundary to have caught an error",
    };
  },
  toHaveCaughtErrorMatching(this: unknown, received: unknown, pattern: RegExp | string,) {
    if (!isBoundaryResult(received)) {
      return {
        pass   : false,
        message: () => "Expected result from createTestBoundary()",
      };
    }
    const err  = received.getLastError();
    const msg  = err?.message ?? "";
    const pass = typeof pattern === "string" ? msg.includes(pattern) : pattern.test(msg);

    return {
      pass,
      message: () => pass ? `Expected error message not to match ${String(pattern)}` : `Expected error message to match ${String(pattern)}, got "${msg}"`,
    };
  },
} as const;

export function installMatchers() {
  const e = (
    globalThis as unknown as {
      expect?: { extend: (m: Record<string, unknown>) => void };
    }
  ).expect;

  if (!e) return;
  
  e.extend(matchers as unknown as Record<string, unknown>);
}
