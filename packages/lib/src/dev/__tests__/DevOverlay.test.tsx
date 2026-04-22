import { fireEvent, render, screen } from "@testing-library/react";
import { DevOverlay } from "../DevOverlay";
import type { ErrorContext, FallbackProps } from "../../core/types";

test("renders error and breadcrumbs and calls resetError", () => {
  const resetError = vi.fn();
  const error = new Error("boom");
  const ctx: ErrorContext = {
    error,
    fingerprint   : "fp",
    breadcrumbs   : [{ type: "custom", timestamp: 1, message: "b1" }],
    componentStack: "at X",
    timestamp     : 1,
    sessionId     : "s",
    errorCount    : 1,
    boundaryProps : { recovery: { maxRetries: 3 } },
  };

  const props: FallbackProps = {
    error,
    errorContext: ctx,
    resetError,
    retryCount: 1,
  };

  render(<DevOverlay {...props} />);
  // "boom" can appear both in the header and in the stack trace.
  expect(screen.getByText(/^Error: boom$/, { selector: "div" })).toBeInTheDocument();
  expect(screen.getByText(/breadcrumbs/)).toBeInTheDocument();
  expect(screen.getByText(/b1/)).toBeInTheDocument();
  expect(screen.getByText(/retries left: 2/)).toBeInTheDocument();

  fireEvent.click(screen.getByText("retry"));
  expect(resetError).toHaveBeenCalledTimes(1);
});
