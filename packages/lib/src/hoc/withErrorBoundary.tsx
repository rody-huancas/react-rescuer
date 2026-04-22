import * as React from "react";
import { ErrorBoundary } from "../core/ErrorBoundary";
import type { ErrorBoundaryProps } from "../core/types";

export function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, options?: Omit<ErrorBoundaryProps, "children">): React.ComponentType<P> {
  const Wrapped: React.FC<P> = (props) => {
    return (
      <ErrorBoundary {...options}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  Wrapped.displayName = `withErrorBoundary(${Component.displayName ?? Component.name ?? "Component"})`;
  return Wrapped;
}
