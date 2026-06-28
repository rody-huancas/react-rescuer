# Async Errors

`componentDidCatch` de React solo captura errores que ocurren durante el renderizado del árbol de componentes. Los errores en event handlers, `setTimeout`, `Promise.catch` o código `async/await` son invisibles para el boundary — a menos que los reenvíes manualmente.

## Por qué `componentDidCatch` no captura async

```tsx
function BadExample() {
  const handleClick = async () => {
    const data = await fetch('/api/data').then(r => r.json())
    // ❌ If this throws, React does NOT catch it. The error reaches
    //    the global unhandledrejection and the app can fail silently.
    processData(data)
  }

  return <button onClick={handleClick}>Load</button>
}
```

## `useErrorBoundary` — reenviar errores al boundary

```tsx
import { useErrorBoundary } from 'react-rescuer/hooks'

function SaveButton() {
  // showBoundary queues the error into React state.
  // On the next render, the component throws and the boundary catches it.
  const { showBoundary } = useErrorBoundary()

  const handleClick = async () => {
    try {
      await api.save()
    } catch (error) {
      // The error now enters the normal error boundary flow
      showBoundary(error as Error)
    }
  }

  return (
    <button type="button" onClick={handleClick}>
      Save
    </button>
  )
}
```

El componente que usa `useErrorBoundary` debe estar dentro de un `ErrorBoundary`:

```tsx
import { ErrorBoundary } from 'react-rescuer'

<ErrorBoundary
  fallback={<p>Save failed. Please try again.</p>}
>
  <SaveButton />
</ErrorBoundary>
```

## Cómo funciona internamente

`showBoundary` llama a `setError(error)`, que actualiza el estado interno. Un `useEffect` detecta el cambio y activa `setShouldThrow(true)`. En el siguiente render, el componente lanza sincrónicamente — y el boundary lo captura con `componentDidCatch`.

## Patrones comunes

### `useEffect` con fetch

```tsx
import { useEffect, useState } from 'react'
import { useErrorBoundary } from 'react-rescuer/hooks'

function UserProfile({ userId }: { userId: string }) {
  const { showBoundary } = useErrorBoundary()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchUser(userId)
      .then(data => { if (!cancelled) setUser(data) })
      .catch(showBoundary) // rejection is forwarded to the boundary

    return () => { cancelled = true }
  }, [userId, showBoundary])

  if (!user) return <Spinner />
  return <Profile user={user} />
}
```

### Callbacks de librerías de terceros

```tsx
import { useEffect } from 'react'
import { useErrorBoundary } from 'react-rescuer/hooks'

function MapWidget() {
  const { showBoundary } = useErrorBoundary()

  useEffect(() => {
    // The map SDK may fail internally.
    // With onError we can redirect the error to the boundary.
    const map = createMap({
      onError: (err) => showBoundary(err),
    })

    return () => map.destroy()
  }, [showBoundary])

  return <div id="map-container" />
}
```

### Manejo de errores tipados

El genérico `E` permite propagar el tipo del error hasta el fallback:

```tsx
class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

function DataLoader() {
  const { showBoundary } = useErrorBoundary<ApiError>()

  useEffect(() => {
    fetchData().catch(err => {
      if (err instanceof ApiError) {
        showBoundary(err) // typed as ApiError
      }
    })
  }, [showBoundary])

  return <Data />
}

// In the fallback, error is already typed as ApiError
<ErrorBoundary<ApiError>
  fallbackRender={({ error }) => <p>HTTP {error.statusCode}: {error.message}</p>}
>
  <DataLoader />
</ErrorBoundary>
```

## `useErrorContext` — acceder al contexto desde el fallback

Disponible dentro del árbol de fallback para acceder al `ErrorContext` del boundary activo:

```tsx
import { useErrorContext } from 'react-rescuer/hooks'

function FallbackDetails() {
  // Throws if used outside an active fallback.
  // Only call it inside FallbackComponent or fallbackRender.
  const ctx = useErrorContext()

  return (
    <div>
      <p>Error ID: <code>{ctx.fingerprint}</code></p>
      <p>Session: <code>{ctx.sessionId}</code></p>
      <p>Occurred at: {new Date(ctx.timestamp).toLocaleString()}</p>

      {ctx.breadcrumbs.length > 0 && (
        <details>
          <summary>Last {ctx.breadcrumbs.length} actions</summary>
          
          <ol>
            {ctx.breadcrumbs.map((b, i) => (
              <li key={i}>[{b.type}] {b.message}</li>
            ))}
          </ol>
        </details>
      )}
    </div>
  )
}

// Use it inside a FallbackComponent
function MyFallback({ error, resetError }: FallbackProps) {
  return (
    <div role="alert">
      <h2>{error.message}</h2>
      <FallbackDetails />
      <button type="button" onClick={resetError}>Try again</button>
    </div>
  )
}

<ErrorBoundary FallbackComponent={MyFallback}>
  <Page />
</ErrorBoundary>
```

::: warning
`useErrorContext` lanza `Error("useErrorContext must be used within an ErrorBoundary fallback")` si se llama fuera de un fallback activo. No es seguro llamarlo desde children normales.
:::
