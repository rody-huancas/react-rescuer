import type { ErrorContext, RecoveryStrategy } from "../../core/types";
import { RetryManager, createExponentialBackoff } from "../RetryManager";

function ctx(error: Error): ErrorContext {
  return {
    error,
    fingerprint   : "fp",
    breadcrumbs   : [],
    componentStack: "",
    timestamp     : Date.now(),
    sessionId     : "s",
    errorCount    : 1,
  };
}

test("createExponentialBackoff grows and caps", () => {
  const backoff = createExponentialBackoff(100, 500);
  expect(backoff(1)).toBe(100);
  expect(backoff(2)).toBe(200);
  expect(backoff(3)).toBe(400);
  expect(backoff(4)).toBe(500);
});

test("next increments per boundary and respects maxRetries", () => {
  const strategy: RecoveryStrategy = { maxRetries: 2 };
  const rm      = new RetryManager(strategy, () => 0);
  const error   = new Error("boom");
  const context = ctx(error);

  expect(rm.next("b", error, context).ok).toBe(true);
  expect(rm.next("b", error, context).ok).toBe(true);
  expect(rm.next("b", error, context).ok).toBe(false);
});

test("calls onMaxRetriesReached when exceeded", () => {
  const onMaxRetriesReached = vi.fn();
  const strategy: RecoveryStrategy = { maxRetries: 1, onMaxRetriesReached };
  const rm      = new RetryManager(strategy, () => 0);
  const error   = new Error("boom");
  const context = ctx(error);

  rm.next("b", error, context);
  rm.next("b", error, context);

  expect(onMaxRetriesReached).toHaveBeenCalledTimes(1);
});
