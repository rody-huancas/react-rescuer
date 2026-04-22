import type { ErrorContext } from "../../core/types";
import { createSentryReporter } from "../sentry";

test("reports to sentry instance with scope data", () => {
  const calls: {
    tags    : Array<[string, string]>;
    contexts: Array<[string, Record<string, unknown>]>;
    captured: unknown[];
  } = { tags: [], contexts: [], captured: [] };

  const Sentry = {
    withScope(
      cb: (scope: {
        setTag    : (k: string, v: string) => void;
        setContext: (k: string, v: Record<string, unknown>) => void;
      }) => void,
    ) {
      cb({
        setTag(k, v) {
          calls.tags.push([k, v]);
        },
        setContext(k, v) {
          calls.contexts.push([k, v]);
        },
      });
    },
    captureException(err: unknown) {
      calls.captured.push(err);
    },
  };

  const reporter = createSentryReporter(Sentry);
  const error    = new Error("boom");
  const context: ErrorContext = {
    error,
    fingerprint   : "fp",
    breadcrumbs   : [{ type: "custom", timestamp: 1, message: "x" }],
    componentStack: "at X",
    timestamp     : 1,
    sessionId     : "s",
    errorCount    : 1,
  };

  reporter.report(context);

  expect(calls.tags).toContainEqual(["errorFingerprint", "fp"]);
  expect(calls.contexts.some(([k]) => k === "breadcrumbs")).toBe(true);
  expect(calls.captured[0]).toBe(error);
});
