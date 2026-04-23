import * as React from "react";
import { ErrorContextContext } from "./context";
import type { ErrorBoundaryProps, ErrorContext, FallbackProps, ResetReason } from "./types";

type ErrorBoundaryState<E extends Error> = {
  error       : E | null;
  errorInfo   : React.ErrorInfo | null;
  errorContext: ErrorContext | null;
  retryCount  : number;
  errorCount  : number;
};

declare function require(id: string): unknown;

declare const process:
  | undefined
  | {
      env?: {
        NODE_ENV?: string;
      };
    };

const DEFAULT_SESSION_ID = (() => {
  const rand = Math.random().toString(36).slice(2);
  return `rr_${rand}`;
})();

function areArraysEqual(a: unknown[] = [], b: unknown[] = []) {
  if (a === b) return true;

  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }

  return true;
}

function safeComponentStack(stack: string | null | undefined) {
  return (stack ?? "").trim();
}

function defaultDjb2(input: string) {
  let hash = 5381;

  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }

  return (hash >>> 0).toString(16);
}

function defaultFingerprint(error: Error) {
  const stack = typeof error.stack === "string" ? error.stack : "";
  const lines = stack.split("\n").slice(0, 3).join("\n");

  return defaultDjb2(`${error.name}\n${lines}`);
}

function snapshotBoundaryProps(props: Record<string, unknown>) {
  const {
    children         : _children,
    FallbackComponent: _fc,
    fallback         : _fb,
    fallbackRender   : _fr,
    ...rest
  } = props;
  return rest;
}

function maybeDispatchResetEvent(sessionId: string) {
  try {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("react-rescuer:reset", {
        detail: { sessionId },
      }),
    );
  } catch {
    // ignore
  }
}

export class ErrorBoundary<E extends Error = Error> extends React.Component<
  ErrorBoundaryProps<E>,
  ErrorBoundaryState<E>
> {
  static defaultProps: Partial<ErrorBoundaryProps> = {
    level  : "section",
    isolate: false,
  };

  state: ErrorBoundaryState<E> = {
    error       : null,
    errorInfo   : null,
    errorContext: null,
    retryCount  : 0,
    errorCount  : 0,
  };

  private sessionId = DEFAULT_SESSION_ID;
  private pendingResetTimer: ReturnType<typeof setTimeout> | null = null;

  componentWillUnmount() {
    if (this.pendingResetTimer) clearTimeout(this.pendingResetTimer);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps<E>) {
    if (!this.state.error) return;

    const prevKeys = prevProps.resetKeys;
    const nextKeys = this.props.resetKeys;

    if (!areArraysEqual(prevKeys ?? [], nextKeys ?? [])) {
      this.reset("resetKeys");
    }
  }

  componentDidCatch(error: E, errorInfo: React.ErrorInfo) {
    const errorCount = this.state.errorCount + 1;
    const retryCount = this.state.retryCount;

    const boundaryProps = snapshotBoundaryProps(
      this.props as unknown as Record<string, unknown>,
    );

    const contextBuilder = this.props.contextBuilder;
    const builderOptions: Parameters<NonNullable<ErrorBoundaryProps<E>["contextBuilder"]>>[2] = {
      sessionId: this.sessionId,
      errorCount,
      retryCount,
      boundaryProps,
    };

    if (this.props.getBreadcrumbs) {
      builderOptions.getBreadcrumbs = this.props.getBreadcrumbs;
    }

    if (this.props.fingerprint) {
      builderOptions.fingerprint = this.props.fingerprint;
    }

    const errorContext: ErrorContext = contextBuilder
      ? contextBuilder(error, errorInfo, builderOptions)
      : {
          error,
          fingerprint   : (this.props.fingerprint?.(error) ?? defaultFingerprint(error)) as string,
          breadcrumbs   : this.props.getBreadcrumbs?.() ?? [],
          componentStack: safeComponentStack(errorInfo.componentStack),
          timestamp     : Date.now(),
          sessionId     : this.sessionId,
          errorCount,
          boundaryProps,
        };

    this.setState({ error, errorInfo, errorContext, errorCount });

    this.props.onError?.(error, errorInfo, errorContext);
  }

  private reset(reason: ResetReason) {
    if (this.pendingResetTimer) clearTimeout(this.pendingResetTimer);
    this.pendingResetTimer = null;
    this.props.onReset?.({ reason });

    maybeDispatchResetEvent(this.sessionId);

    this.setState({
      error       : null,
      errorInfo   : null,
      errorContext: null,
      retryCount  : reason === "retry" ? this.state.retryCount: 0,
    });
  }

  private scheduleRetry(delayMs: number) {
    if (this.pendingResetTimer) clearTimeout(this.pendingResetTimer);

    this.pendingResetTimer = setTimeout(
      () => {
        this.pendingResetTimer = null;
        this.reset("retry");
      },
      Math.max(0, delayMs),
    );
  }

  private resetError = () => {
    const { error, errorContext } = this.state;
    if (!error || !errorContext) return;

    const recovery = this.props.recovery;
    if (!recovery) {
      this.reset("imperative");
      return;
    }

    const isRecoverable = recovery.isRecoverable?.(error) ?? true;
    if (!isRecoverable) {
      this.reset("imperative");
      return;
    }

    const nextAttempt = this.state.retryCount + 1;
    if (nextAttempt > recovery.maxRetries) {
      recovery.onMaxRetriesReached?.(error, errorContext);
      return;
    }

    this.setState({ retryCount: nextAttempt });

    const delay = typeof recovery.retryDelay === "function"
      ? recovery.retryDelay(nextAttempt, error)
      : typeof recovery.retryDelay === "number" ? recovery.retryDelay : 0;

    this.scheduleRetry(delay);
  };

  render() {
    const { error, errorContext } = this.state;

    if (!error || !errorContext) return this.props.children;

    const fallbackProps: FallbackProps<E> = {
      error,
      errorContext,
      resetError: this.resetError,
      retryCount: this.state.retryCount,
    };

    const nodeEnv = process?.env?.NODE_ENV ?? "production";
    if (nodeEnv === "development") {
      // Rule: conditional import via require
      let DevOverlay: React.ComponentType<FallbackProps<E>> | null = null;
      try {
        DevOverlay = (
          require("../dev/DevOverlay") as {
            DevOverlay: React.ComponentType<FallbackProps<E>>;
          }
        ).DevOverlay;
      } catch {
        DevOverlay = null;
      }

      if (DevOverlay) {
        return (
          <ErrorContextContext.Provider value={errorContext}>
            <DevOverlay {...fallbackProps} />
          </ErrorContextContext.Provider>
        );
      }
    }

    const { FallbackComponent, fallbackRender, fallback } = this.props;

    let node: React.ReactNode = null;
    
    if (FallbackComponent) node = <FallbackComponent {...fallbackProps} />;
    else if (fallbackRender) node = fallbackRender(fallbackProps);
    else node = fallback ?? null;

    return (
      <ErrorContextContext.Provider value={errorContext}>
        {node}
      </ErrorContextContext.Provider>
    );
  }
}
