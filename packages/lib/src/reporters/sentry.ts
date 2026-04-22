import type { ErrorReporter } from "../core/types";

type SentryScope = {
  setTag    : (key: string, value: string) => void;
  setContext: (key: string, value: Record<string, unknown>) => void;
};

export type SentryInstance = {
  withScope       : (cb: (scope: SentryScope) => void) => void;
  captureException: (error: unknown) => void;
};

export function createSentryReporter(Sentry: SentryInstance): ErrorReporter {
  return {
    report(context) {
      Sentry.withScope((scope) => {
        scope.setTag("errorFingerprint", context.fingerprint);
        scope.setContext("breadcrumbs", { items: context.breadcrumbs });
        scope.setContext("component", { stack: context.componentStack });
        Sentry.captureException(context.error);
      });
    },
  };
}
