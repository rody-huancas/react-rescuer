import * as React from "react";
import { useMemo, useRef } from "react";
import { ErrorBoundary } from "../core/ErrorBoundary";
import type { ErrorBoundaryProps, ErrorContext, FallbackProps } from "../core/types";

export function createTestBoundary(options: Partial<ErrorBoundaryProps> = {}): {
  Boundary      : React.ComponentType<{ children: React.ReactNode }>;
  getLastError  : () => Error | null;
  getLastContext: () => ErrorContext | null;
  reset         : () => void;
} {
  let lastError: Error | null          = null;
  let lastContext: ErrorContext | null = null;
  let lastReset: (() => void) | null   = null;

  function Boundary({ children }: { children: React.ReactNode }) {
    const resetRef = useRef<(() => void) | null>(null);

    const fallbackRender = useMemo(() => {
      return (props: FallbackProps) => {
        lastReset = props.resetError;
        resetRef.current = props.resetError;
		
        return <div data-testid="rr-caught">caught:{props.error.message}</div>;
      };
    }, []);

    return (
      <ErrorBoundary
        {...options}
        fallbackRender={fallbackRender}
        onError={(error, info, context) => {
          options.onError?.(error, info, context);
          lastError = error;
          lastContext = context;
        }}
        onReset={(details) => {
          options.onReset?.(details);
          lastError = null;
          lastContext = null;
        }}
      >
        {children}
      </ErrorBoundary>
    );
  }

  return {
    Boundary,
    getLastError: () => lastError,
    getLastContext: () => lastContext,
    reset: () => {
      lastReset?.();
    },
  };
}
