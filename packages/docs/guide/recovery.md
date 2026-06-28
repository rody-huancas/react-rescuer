# Automatic Recovery

La prop `recovery` convierte un boundary pasivo en un sistema de reintentos automáticos: cuando se captura un error, espera el tiempo configurado y vuelve a montar los children sin que el usuario tenga que hacer nada.

## La prop `recovery`

```ts
type RecoveryStrategy<E extends Error = Error> = {
  // Maximum number of retries before giving up and leaving the fallback visible.
  maxRetries: number

  // Wait time between retries (ms).
  // number   → fixed delay
  // function → dynamic delay based on the attempt number and the error
  // omitted  → immediate retry (0 ms)
  retryDelay?: number | ((attempt: number, error: E) => number)

  // If it returns false, no retry is scheduled and the fallback stays visible permanently.
  // Defaults to always returning true.
  isRecoverable?: (error: E) => boolean

  // Called once when retries are exhausted.
  onMaxRetriesReached?: (error: E, context: ErrorContext) => void
}
```

## Ejemplo básico

```tsx
import { ErrorBoundary } from 'react-rescuer'

<ErrorBoundary
  recovery={{
    maxRetries: 3,   // up to 3 automatic retries
    retryDelay: 500, // wait 500 ms between each attempt
  }}
  fallbackRender={({ error, retryCount }) => (
    <div>
      <p>{error.message}</p>
      {/* retryCount shows how many retries have been made */}
      <p>Retrying… attempt {retryCount} of 3</p>
    </div>
  )}
>
  <DataWidget />
</ErrorBoundary>
```

Mientras quedan reintentos, el fallback se muestra brevemente y luego desaparece al resetear. Si los 3 reintentos fallan, el fallback queda visible permanentemente.

## Backoff exponencial

El patrón más común: duplicar el delay en cada intento para no saturar un servicio caído:

```tsx
<ErrorBoundary
  recovery={{
    maxRetries: 5,
    // attempt 1 → 250ms, 2 → 500ms, 3 → 1000ms, 4 → 2000ms, 5 → 4000ms
    retryDelay: (attempt) => Math.min(8_000, 250 * 2 ** (attempt - 1)),
  }}
  fallbackRender={({ error, retryCount }) => (
    <p>Connecting… ({retryCount}/5)</p>
  )}
>
  <LiveFeed />
</ErrorBoundary>
```

## `isRecoverable` — errores no recuperables

Usa `isRecoverable` para saltar la lógica de reintentos en errores que no van a resolverse solos:

```tsx
class AuthError extends Error { name = 'AuthError' }
class NetworkError extends Error { name = 'NetworkError' }

<ErrorBoundary
  recovery={{
    maxRetries: 3,
    retryDelay: 1_000,
    // Only retries network errors; auth errors are shown immediately
    isRecoverable: (error) => error instanceof NetworkError,
  }}
  fallbackRender={({ error, retryCount }) =>
    error instanceof AuthError
      ? <p>Session expired. Please log in again.</p>
      : <p>Network error — retrying ({retryCount}/3)…</p>
  }
>
  <Dashboard />
</ErrorBoundary>
```

Cuando `isRecoverable` devuelve `false`, el boundary llama a `reset('imperative')` inmediatamente — el fallback queda visible y no se programa ningún reintento.

## `onMaxRetriesReached` — cuando se agotan los reintentos

```tsx
<ErrorBoundary
  recovery={{
    maxRetries: 3,
    retryDelay: (attempt) => 250 * 2 ** (attempt - 1),
    onMaxRetriesReached: (error, ctx) => {
      // Report to Sentry, Datadog, etc.
      // ctx includes fingerprint, breadcrumbs, sessionId…
      reportToSentry(error, {
        extra: {
          fingerprint: ctx.fingerprint,
          sessionId  : ctx.sessionId,
          breadcrumbs: ctx.breadcrumbs,
        },
      })
    },
  }}
  fallback={<p>We couldn't recover. Our team has been notified.</p>}
>
  <Widget />
</ErrorBoundary>
```

## `RetryManager` — orquestación de múltiples boundaries

Cuando tienes un dashboard con varios widgets independientes, `RetryManager` centraliza el estado de reintentos para todos ellos:

```tsx
import { RetryManager, createExponentialBackoff } from 'react-rescuer/recovery'

// Creates a shared instance. createExponentialBackoff(baseMs, maxMs)
// returns (attempt) => min(maxMs, baseMs * 2^(attempt-1))
const retryManager = new RetryManager(
  {
    maxRetries         : 5,
    isRecoverable      : (error) => error.name !== 'FatalError',
    onMaxRetriesReached: (error, ctx) => {
      console.warn('gave up:', ctx.fingerprint)
    },
  },
  createExponentialBackoff(250, 10_000),
)
```

Úsalo dentro del callback `onError` de cada boundary:

```tsx
function ManagedWidget({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, _info, ctx) => {
        // Ask the manager if this boundary can retry
        const { ok, delayMs } = retryManager.next(id, error, ctx)

        if (ok) {
          // Schedule the reset manually after the calculated delay
          setTimeout(() => {
            // resetError is not available in onError — trigger the reset
            // via resetKeys or external state instead
          }, delayMs)
        }
      }}
      onReset={() => {
        // Clear the counter when the boundary recovers
        retryManager.reset(id)
      }}
      fallback={<p>Widget {id} failed.</p>}
    >
      {children}
    </ErrorBoundary>
  )
}

// Usage
<ManagedWidget id="revenue-chart"><RevenueChart /></ManagedWidget>
<ManagedWidget id="activity-feed"><ActivityFeed /></ManagedWidget>
<ManagedWidget id="alerts-panel"><AlertsPanel /></ManagedWidget>
```

### API de `RetryManager`

```ts
class RetryManager<E extends Error = Error> {
  // Constructs with a strategy and an optional backoff function.
  // If backoff is omitted, uses createExponentialBackoff(250, 10_000) by default.
  constructor(recovery: RecoveryStrategy<E>, backoff?: BackoffFn)

  // Returns the current attempt count for a boundary.
  getAttempt(boundaryId: string): number

  // Returns true if isRecoverable(error) is true (or if isRecoverable is not defined).
  canRecover(error: E): boolean

  // Main method. Increments the counter, calculates the delay and returns:
  //   ok: false if not recoverable or retries are exhausted
  //   attempt: current attempt number
  //   delayMs: time to wait before calling reset
  next(boundaryId: string, error: E, context: ErrorContext): {
    ok     : boolean
    attempt: number
    delayMs: number
  }

  // Clears the counter for a boundary (call it in onReset).
  reset(boundaryId: string): void
}
```

## `createExponentialBackoff`

```ts
import { createExponentialBackoff } from 'react-rescuer/recovery'

// Formula: min(maxMs, baseMs * 2^(attempt - 1))
const backoff = createExponentialBackoff(250, 10_000)

backoff(1) // 250
backoff(2) // 500
backoff(3) // 1000
backoff(4) // 2000
backoff(5) // 4000
backoff(7) // 10000  ← capped at maxMs
```

Devuelve un `BackoffFn` — `(attempt: number) => number` — listo para pasarlo al constructor de `RetryManager`.
