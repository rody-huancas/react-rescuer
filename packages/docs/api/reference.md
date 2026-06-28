# API Reference

Referencia completa de todos los tipos exportados y entry points de `react-rescuer`.

## Entry points

```ts
import { ErrorBoundary } from 'react-rescuer'
import { withErrorBoundary } from 'react-rescuer/hoc'
import { useErrorBoundary, useErrorContext } from 'react-rescuer/hooks'
import { createTestBoundary, installMatchers } from 'react-rescuer/testing'
import { RetryManager, createExponentialBackoff } from 'react-rescuer/recovery'
import { addBreadcrumb, buildErrorContext, fingerprintError, getBreadcrumbTrail, BreadcrumbTrail } from 'react-rescuer/observability'
```

---

## `react-rescuer`

### `ErrorBoundary<E extends Error = Error>`

Componente de clase. Captura errores de render en su subárbol.

```ts
type ErrorBoundaryProps<E extends Error = Error> = {
  children: React.ReactNode

  // Fallback UI — pick one of the three
  fallback         ?: React.ReactNode
  fallbackRender   ?: (props: FallbackProps<E>) => React.ReactNode
  FallbackComponent?: React.ComponentType<FallbackProps<E>>

  // Automatic reset when any of these values changes
  resetKeys?: unknown[]

  // Callbacks
  onError?: (error: E, errorInfo: React.ErrorInfo, errorContext: ErrorContext) => void
  onReset?: (details: { reason: ResetReason }) => void

  // Automatic retries
  recovery?: RecoveryStrategy<E>

  // Observability — replace or complement the default contextBuilder
  getBreadcrumbs?: () => Breadcrumb[]
  fingerprint   ?: (error: E) => string
  contextBuilder?: (
    error    : E,
    errorInfo: React.ErrorInfo,
    options  : {
      sessionId      : string
      errorCount     : number
      retryCount     : number
      boundaryProps ?: unknown
      getBreadcrumbs?: () => Breadcrumb[]
      fingerprint   ?: (error: E) => string
    }
  ) => ErrorContext

  // Semantic hint (does not affect current behavior)
  level  ?: 'page' | 'section' | 'component' // default: 'section'
  isolate?: boolean                          // default: false
}
```

---

### `FallbackProps<E extends Error = Error>`

Props recibidas por `fallbackRender` y `FallbackComponent`:

```ts
type FallbackProps<E extends Error = Error> = {
  error       : E             // The caught error
  errorContext: ErrorContext  // Structured context (fingerprint, breadcrumbs, etc.)
  resetError  : () => void    // Clears the error state and re-renders children
  retryCount  : number        // Number of automatic retries performed
}
```

---

### `ErrorContext`

Construido automáticamente por el boundary en cada `componentDidCatch`:

```ts
type ErrorContext = {
  error         : Error         // The original Error object
  fingerprint   : string        // Stable DJB2 hash of the error
  breadcrumbs   : Breadcrumb[]  // Last ≤20 user actions
  componentStack: string        // React component tree
  sessionId     : string        // Unique ID per page load ('rr_<random>')
  errorCount    : number        // Number of errors caught by this boundary
  timestamp     : number        // Date.now() at catch time
  boundaryProps?: unknown       // Boundary props snapshot (via buildErrorContext)
}
```

---

### `RecoveryStrategy<E extends Error = Error>`

```ts
type RecoveryStrategy<E extends Error = Error> = {
  maxRetries          : number
  retryDelay         ?: number | ((attempt: number, error: E) => number)
  isRecoverable      ?: (error: E) => boolean
  onMaxRetriesReached?: (error: E, context: ErrorContext) => void
}
```

---

### `Breadcrumb`

```ts
type BreadcrumbType = 'click' | 'navigation' | 'custom'

type Breadcrumb = {
  type     : BreadcrumbType
  timestamp: number
  message ?: string
  data    ?: Record<string, unknown>
}
```

---

### `ResetReason`

```ts
type ResetReason =
  | 'imperative'  // resetError() called manually from the fallback
  | 'resetKeys'   // a value in resetKeys changed
  | 'retry'       // an automatic retry via the recovery prop
```

---

### `ErrorBoundaryLevel`

```ts
type ErrorBoundaryLevel = 'page' | 'section' | 'component'
```

---

## `react-rescuer/hooks`

### `useErrorBoundary<E extends Error = Error>()`

Permite reenviar errores de event handlers y código async al boundary más cercano.

```ts
function useErrorBoundary<E extends Error = Error>(): {
  showBoundary: (error: E) => void
}
```

Lanza el error en el siguiente ciclo de render, donde `componentDidCatch` lo captura normalmente.

---

### `useErrorContext()`

Devuelve el `ErrorContext` del boundary activo más cercano.

```ts
function useErrorContext(): ErrorContext
```

::: warning
Lanza `Error("useErrorContext must be used within an ErrorBoundary fallback")` si se llama fuera de un fallback activo. Solo es seguro dentro de `FallbackComponent` o `fallbackRender`.
:::

---

## `react-rescuer/hoc`

### `withErrorBoundary(Component, options?)`

Envuelve un componente con un `ErrorBoundary`. `options` acepta todas las props de `ErrorBoundaryProps` excepto `children`.

```ts
function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options  ?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P>
```

El `displayName` del componente resultante será `withErrorBoundary(NombreOriginal)`.

---

## `react-rescuer/observability`

### `buildErrorContext`

Implementación de referencia del `contextBuilder`. Usa el singleton `BreadcrumbTrail` para capturar breadcrumbs automáticamente.

```ts
function buildErrorContext<E extends Error = Error>(
  error    : E,
  errorInfo: React.ErrorInfo,
  options  : {
    sessionId      : string
    errorCount     : number
    retryCount     : number
    boundaryProps ?: unknown
    getBreadcrumbs?: () => Breadcrumb[]
    fingerprint   ?: (error: E) => string
  }
): ErrorContext
```

---

### `addBreadcrumb(input)`

Añade una entrada al singleton `BreadcrumbTrail`:

```ts
function addBreadcrumb(input: {
  type      : BreadcrumbType
  message  ?: string
  data     ?: Record<string, unknown>
  timestamp?: number  // default: Date.now()
}): void
```

---

### `getBreadcrumbTrail()`

Devuelve el singleton `BreadcrumbTrail`. Lo arranca en el primer uso (instala listeners de click y navegación).

```ts
function getBreadcrumbTrail(): BreadcrumbTrail
```

---

### `BreadcrumbTrail`

```ts
class BreadcrumbTrail {
  start(): void   // installs event listeners (click, pushState, replaceState, popstate)
  stop(): void    // removes all event listeners
  add(input: Omit<Breadcrumb, 'timestamp'> & { timestamp?: number }): void
  get(): Breadcrumb[]  // returns a copy of the current state
  clear(): void        // empties the trail
}
```

El trail tiene un máximo de 20 entradas. Las más antiguas se descartan cuando se llena.

---

### `fingerprintError(error)`

Hash DJB2 del nombre del error más sus primeras 3 líneas de stack.

```ts
function fingerprintError(error: Error): string
```

---

## `react-rescuer/recovery`

### `RetryManager<E extends Error = Error>`

Orquesta reintentos a través de múltiples boundaries.

```ts
class RetryManager<E extends Error = Error> {
  // default backoff: createExponentialBackoff(250, 10_000)
  constructor(recovery: RecoveryStrategy<E>, backoff?: BackoffFn)

  // Number of attempts registered for a boundary
  getAttempt(boundaryId: string): number

  // true if isRecoverable(error) is not defined or returns true
  canRecover(error: E): boolean

  // Advances the counter and returns whether a retry is possible and how long to wait
  next(boundaryId: string, error: E, context: ErrorContext): {
    ok     : boolean  // false if not recoverable or maxRetries exhausted
    attempt: number   // current attempt number
    delayMs: number   // calculated wait time (0 if ok=false)
  }

  // Clears the counter for a boundary (call it in onReset)
  reset(boundaryId: string): void
}
```

---

### `createExponentialBackoff(baseMs, maxMs)`

```ts
type BackoffFn = (attempt: number) => number

function createExponentialBackoff(baseMs: number, maxMs: number): BackoffFn
// Formula: min(maxMs, baseMs * 2^(attempt - 1))
```

---

## `react-rescuer/testing`

### `createTestBoundary(options?)`

```ts
function createTestBoundary(options?: Partial<ErrorBoundaryProps>): {
  Boundary      : React.ComponentType<{ children: React.ReactNode }>
  getLastError  : () => Error | null
  getLastContext: () => ErrorContext | null
  reset         : () => void
}
```

### `installMatchers()`

Extiende `expect` de vitest/jest con los matchers de react-rescuer. Llámalo una vez en el setup de tests.

```ts
function installMatchers(): void
```

### `toHaveCaughtError()`

Pasa cuando el boundary capturó al menos un error.

### `toHaveCaughtErrorMatching(pattern: string | RegExp)`

Pasa cuando el mensaje del error capturado contiene el string o coincide con el RegExp.
