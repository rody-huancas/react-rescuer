import { createCustomReporter } from "../custom";
import type { ErrorContext } from "../../core/types";

test("createCustomReporter preserves type and forwards report", () => {
  const report   = vi.fn();
  const reporter = createCustomReporter(report);
  const context  = {
    error         : new Error("boom"),
    fingerprint   : "fp",
    breadcrumbs   : [],
    componentStack: "",
    timestamp     : 1,
    sessionId     : "s",
    errorCount    : 1,
  } satisfies ErrorContext;

  reporter.report(context);
  expect(report).toHaveBeenCalledWith(context);
});
