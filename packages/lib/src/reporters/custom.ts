import type { ErrorReporter } from "../core/types";

export function createCustomReporter(report: ErrorReporter["report"]): ErrorReporter {
  return { report };
}
