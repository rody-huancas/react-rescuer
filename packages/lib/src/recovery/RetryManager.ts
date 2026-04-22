import type { ErrorContext, RecoveryStrategy } from "../core/types";

export type BackoffFn = (attempt: number) => number;

export function createExponentialBackoff(baseMs: number, maxMs: number): BackoffFn {
  return (attempt) => {
    const raw = baseMs * 2 ** Math.max(0, attempt - 1);
    return Math.min(maxMs, raw);
  };
}

export class RetryManager<E extends Error = Error> {
  private attempts = new Map<string, number>();
  private recovery: RecoveryStrategy<E>;
  private defaultBackoff: BackoffFn;

  constructor(recovery: RecoveryStrategy<E>, backoff: BackoffFn = createExponentialBackoff(250, 10_000)) {
    this.recovery       = recovery;
    this.defaultBackoff = backoff;
  }

  getAttempt(boundaryId: string) {
    return this.attempts.get(boundaryId) ?? 0;
  }

  reset(boundaryId: string) {
    this.attempts.delete(boundaryId);
  }

  canRecover(error: E) {
    return this.recovery.isRecoverable?.(error) ?? true;
  }

  next(boundaryId: string, error: E, context: ErrorContext): {
    ok     : boolean;
    attempt: number;
    delayMs: number;
  } {
    if (!this.canRecover(error)) {
      return { ok: false, attempt: this.getAttempt(boundaryId), delayMs: 0 };
    }

    const nextAttempt = this.getAttempt(boundaryId) + 1;

    if (nextAttempt > this.recovery.maxRetries) {
      this.recovery.onMaxRetriesReached?.(error, context);
      return { ok: false, attempt: nextAttempt, delayMs: 0 };
    }

    this.attempts.set(boundaryId, nextAttempt);

    const delayMs = typeof this.recovery.retryDelay === "function"
      ? this.recovery.retryDelay(nextAttempt, error)
      : typeof this.recovery.retryDelay === "number" ? this.recovery.retryDelay : this.defaultBackoff(nextAttempt);

    return { ok: true, attempt: nextAttempt, delayMs };
  }
}
