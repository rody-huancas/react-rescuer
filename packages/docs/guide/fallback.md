# Fallback UI

`ErrorBoundary` acepta tres modos de fallback mutuamente excluyentes. Si se pasan varios, el orden de prioridad es `FallbackComponent` → `fallbackRender` → `fallback`.

## `fallback` — nodo estático

El modo más simple. Acepta cualquier `React.ReactNode`:

```tsx
import { ErrorBoundary } from 'react-rescuer'

export function App() {
  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <Page />
    </ErrorBoundary>
  )
}
```

Úsalo cuando no necesites acceder al error ni a un botón de reset.

## `fallbackRender` — render prop

Recibe [`FallbackProps`](#fallbackprops) y devuelve un nodo. Es el modo más flexible sin definir un componente separado:

```tsx
import { ErrorBoundary } from 'react-rescuer'
import type { FallbackProps } from 'react-rescuer'

<ErrorBoundary
  fallbackRender={({ error, errorContext, resetError, retryCount }: FallbackProps) => (
    <div role="alert">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>

      {/* errorContext includes fingerprint, breadcrumbs, sessionId, etc. */}
      <p>Error ID: {errorContext.fingerprint}</p>
      <p>Session: {errorContext.sessionId}</p>

      {/* retryCount increments on each retry */}
      {retryCount > 0 && <p>Retried {retryCount} time(s)</p>}

      <button type="button" onClick={resetError}>
        Try again
      </button>
    </div>
  )}
>
  <Page />
</ErrorBoundary>
```

## `FallbackComponent` — componente

Mismas props que `fallbackRender`, pero como componente. Preferible cuando el fallback tiene sus propios hooks o estado local:

```tsx
import { ErrorBoundary } from 'react-rescuer'
import type { FallbackProps } from 'react-rescuer'

function ErrorFallback({ error, errorContext, resetError, retryCount }: FallbackProps) {
  // can use hooks normally
  const [copied, setCopied] = useState(false)

  const copyId = () => {
    navigator.clipboard.writeText(errorContext.fingerprint)
    setCopied(true)
  }

  return (
    <div role="alert">
      <h2>{error.name}</h2>
      <p>{error.message}</p>

      <button type="button" onClick={copyId}>
        {copied ? 'Copied!' : 'Copy error ID'}
      </button>
      
      <button type="button" onClick={resetError}>
        Retry {retryCount > 0 && `(attempt ${retryCount})`}
      </button>
    </div>
  )
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Page />
</ErrorBoundary>
```

## `FallbackProps`

Campos disponibles dentro de `fallbackRender` y `FallbackComponent`:

```ts
type FallbackProps<E extends Error = Error> = {
  // The caught error. The generic E allows type narrowing.
  error: E

  // Structured context built at catch time.
  // Includes fingerprint, breadcrumbs, sessionId, componentStack, etc.
  errorContext: ErrorContext

  // Clears the error state and re-renders children.
  // If the `recovery` prop is active, applies the retry logic instead.
  resetError: () => void

  // Number of automatic retries performed so far.
  // Is 0 if the `recovery` prop is not used or no retries have occurred.
  retryCount: number
}
```

## Reset con `resetKeys`

`resetKeys` acepta un array de valores. Cuando alguno cambia mientras el boundary está en estado de error, se reinicia automáticamente — sin que el usuario tenga que pulsar nada:

```tsx
import { useState } from 'react'
import { ErrorBoundary } from 'react-rescuer'

function UserProfile({ userId }: { userId: string }) {
  // If this component throws, the boundary catches it.
  // When userId changes, resetKeys changes → the boundary resets automatically.
  return <Profile id={userId} />
}

export function App() {
  const [userId, setUserId] = useState('user-1')

  return (
    <>
      <button onClick={() => setUserId('user-2')}>Switch user</button>

      {/*
        resetKeys={[userId]}: when userId changes, the boundary
        detects it in componentDidUpdate and calls reset('resetKeys').
      */}
      <ErrorBoundary
        resetKeys={[userId]}
        fallback={<p>Failed to load profile. Switching user will retry.</p>}
      >
        <UserProfile userId={userId} />
      </ErrorBoundary>
    </>
  )
}
```

Los valores en el array se comparan con `Object.is`. Puedes pasar cualquier primitivo, objeto o referencia.

## `onError` — reporte de errores

Se llama una vez cada vez que el boundary captura un error. Recibe el error, el `React.ErrorInfo` y el [`ErrorContext`](/api/reference#errorcontext) completo:

```tsx
<ErrorBoundary
  onError={(error, info, ctx) => {
    // Send to your monitoring backend with the full context
    fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify({
        message    : error.message,
        stack      : error.stack,
        fingerprint: ctx.fingerprint,   // stable hash → useful for deduplication
        sessionId  : ctx.sessionId,     // identifies the user session
        breadcrumbs: ctx.breadcrumbs,   // last actions before the crash
        errorCount : ctx.errorCount,    // how many times this boundary has failed
      }),
    })
  }}
  fallback={<p>Error reported. Our team has been notified.</p>}
>
  <Page />
</ErrorBoundary>
```

## `onReset` — callback de reset

Se llama cada vez que el boundary se resetea, con la razón:

```tsx
<ErrorBoundary
  onReset={({ reason }) => {
    /*
      reason can be:
        'imperative' → the user called resetError() manually
        'resetKeys'  → a value in resetKeys changed
        'retry'      → an automatic retry via the `recovery` prop
    */
    console.log('Boundary reset, reason:', reason)

    if (reason === 'imperative') {
      analytics.track('error_boundary_manual_retry')
    }
  }}
  fallback={<p>Error</p>}
>
  <Page />
</ErrorBoundary>
```

## Narrowing del tipo de error

El genérico `E` en `ErrorBoundary<E>` y `FallbackProps<E>` te permite estrechar el tipo del error capturado:

```tsx
class NetworkError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

<ErrorBoundary<NetworkError>
  fallbackRender={({ error }) => (
    // error is typed as NetworkError — direct access to statusCode
    <p>HTTP {error.statusCode}: {error.message}</p>
  )}
>
  <DataFetcher />
</ErrorBoundary>
```
