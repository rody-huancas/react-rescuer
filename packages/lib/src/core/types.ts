import type React from "react";

export type ErrorBoundaryLevel = "page"  | "section"    | "component";
export type BreadcrumbType     = "click" | "navigation" | "custom";

export type Breadcrumb = {
  type      : BreadcrumbType;
  timestamp : number;
  message  ?: string;
  data     ?: Record<string, unknown>;
};

export type ErrorContext = {
  error          : Error;
  fingerprint    : string;
  breadcrumbs    : Breadcrumb[];
  componentStack : string;
  timestamp      : number;
  sessionId      : string;
  errorCount     : number;
  boundaryProps ?: unknown;
};

export type FallbackProps<E extends Error = Error> = {
  error       : E;
  errorContext: ErrorContext;
  resetError  : () => void;
  retryCount  : number;
};

export type RecoveryStrategy<E extends Error = Error> = {
  maxRetries          : number;
  retryDelay         ?: number | ((attempt: number, error: E) => number);
  isRecoverable      ?: (error: E) => boolean;
  onMaxRetriesReached?: (error: E, context: ErrorContext) => void;
};

export type ResetReason = "imperative" | "resetKeys" | "retry";

export type ErrorBoundaryProps<E extends Error = Error> = {
  children: React.ReactNode;

  level    ?: ErrorBoundaryLevel;
  isolate  ?: boolean;
  resetKeys?: unknown[];

  FallbackComponent?: React.ComponentType<FallbackProps<E>>;
  fallbackRender   ?: (props: FallbackProps<E>) => React.ReactNode;
  fallback         ?: React.ReactNode;

  onError?: (
    error       : E,
    errorInfo   : React.ErrorInfo,
    errorContext: ErrorContext,
  ) => void;
  onReset?: (details: { reason: ResetReason }) => void;

  recovery?: RecoveryStrategy<E>;

  getBreadcrumbs?: () => Breadcrumb[];
  fingerprint   ?: (error: E) => string;
  contextBuilder?: (
    error    : E,
    errorInfo: React.ErrorInfo,
    options  : {
      sessionId      : string;
      errorCount     : number;
      retryCount     : number;
      boundaryProps ?: unknown;
      getBreadcrumbs?: () => Breadcrumb[];
      fingerprint   ?: (error: E) => string;
    },
  ) => ErrorContext;
};
