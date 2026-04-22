import type React from "react";
import type { ErrorContext } from "../core/types";
import { fingerprintError } from "./fingerprint";
import { getBreadcrumbTrail } from "./breadcrumbs";

function safeComponentStack(stack: string | null | undefined) {
  return (stack ?? "").trim();
}

export function buildErrorContext<E extends Error = Error>(
  error    : E,
  errorInfo: React.ErrorInfo,
  options  : {
    sessionId      : string;
    errorCount     : number;
    retryCount     : number;
    boundaryProps ?: unknown;
    getBreadcrumbs?: () => ErrorContext["breadcrumbs"];
    fingerprint   ?: (error: E) => string;
  },
): ErrorContext {
  const breadcrumbs = options.getBreadcrumbs ? options.getBreadcrumbs() : getBreadcrumbTrail().get();

  const fp = options.fingerprint ? options.fingerprint(error) : fingerprintError(error);

  const base: ErrorContext = {
    error,
    fingerprint: fp,
    breadcrumbs,
    componentStack: safeComponentStack(errorInfo.componentStack),
    timestamp     : Date.now(),
    sessionId     : options.sessionId,
    errorCount    : options.errorCount,
  };

  if (options.boundaryProps !== undefined) {
	base.boundaryProps = options.boundaryProps;
  }
  
  return base;
}
