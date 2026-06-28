# Observability

Cada vez que `ErrorBoundary` captura un error, construye un `ErrorContext` con información estructurada lista para enviar a cualquier backend de monitoreo. Todo está disponible en `onError`, `fallbackRender` y `FallbackComponent` sin configuración adicional.

## `ErrorContext` — campos y significado

```ts
type ErrorContext = {
  // The captured Error object.
  error: Error

  // Stable DJB2 hash of the error name + first 3 stack lines.
  // Same for the same error at the same call site across page reloads.
  // Use it to deduplicate incidents in your monitoring backend.
  fingerprint: string

  // Last ≤20 user actions before the crash (clicks, navigation, custom).
  // Empty array if buildErrorContext or getBreadcrumbs is not used.
  breadcrumbs: Breadcrumb[]

  // React component tree stack at the time of the error.
  componentStack: string

  // Unique session ID generated on page load (format: 'rr_<random>').
  // Constant for the entire page lifetime, resets on reload.
  sessionId: string

  // How many times this boundary has caught an error in the current session.
  // Useful for detecting error loops.
  errorCount: number

  // Unix timestamp (Date.now()) at the exact moment of the catch.
  timestamp: number

  // Snapshot of the boundary's props (excludes children and fallback props).
  // Only present when using buildErrorContext as contextBuilder.
  boundaryProps?: unknown
}
```

## `buildErrorContext` — observabilidad completa en una línea

Pásalo como `contextBuilder` para activar breadcrumbs automáticos, fingerprinting y captura de `boundaryProps`:

```tsx
import { ErrorBoundary } from 'react-rescuer'
import { buildErrorContext } from 'react-rescuer/observability'

<ErrorBoundary
  // buildErrorContext is the reference implementation of contextBuilder.
  // Automatically starts the BreadcrumbTrail singleton on first use.
  contextBuilder={buildErrorContext}
  onError={(error, _info, ctx) => {
    // ctx.breadcrumbs → automatically captured user actions
    // ctx.fingerprint → ready-to-use hash for deduplication
    // ctx.sessionId   → identifies the user in this session
    sendToMonitoring(error, ctx)
  }}
  fallback={<p>Something went wrong.</p>}
>
  <CheckoutForm />
</ErrorBoundary>
```

Sin `contextBuilder`, `ErrorBoundary` genera un `ErrorContext` básico igualmente (con fingerprint y sessionId), pero sin breadcrumbs del singleton.

## Breadcrumbs — captura automática

Al llamar `buildErrorContext` o `getBreadcrumbTrail()` por primera vez, se inicia el singleton `BreadcrumbTrail` que escucha:

| Tipo | Evento | Datos capturados |
|---|---|---|
| `click` | Cualquier click en el DOM | Selector del elemento (`tag#id.class`), coordenadas `(x, y)` |
| `navigation` | `pushState`, `replaceState`, `popstate` | URL completa en el momento de la navegación |
| `custom` | `addBreadcrumb()` manual | Lo que tú definas |

El trail mantiene un máximo de **20 entradas**. Cuando se llena, descarta la más antigua.

### Breadcrumbs manuales con `addBreadcrumb`

```tsx
import { addBreadcrumb } from 'react-rescuer/observability'

// In a form handler
function CheckoutForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    addBreadcrumb({
      type   : 'custom',
      message: 'checkout form submitted',
      // data accepts any serializable object
      data   : { step: 'payment', items: cart.length },
    })

    try {
      await api.checkout(cart)
    } catch (error) {
      // if this throws, the boundary will have the breadcrumb above
      throw error
    }
  }

  return <form onSubmit={handleSubmit}>…</form>
}
```

```ts
type Breadcrumb = {
  type     : 'click' | 'navigation' | 'custom'
  timestamp: number
  message ?: string
  data    ?: Record<string, unknown>
}
```

## `fingerprintError` — fingerprinting standalone

Genera el mismo hash que usa `buildErrorContext` internamente. Útil para fingerprint fuera de un boundary:

```ts
import { fingerprintError } from 'react-rescuer/observability'

// Formula: DJB2( error.name + '\n' + first 3 stack lines )
const hash = fingerprintError(new TypeError('Cannot read property')) // e.g. 'a3f9c1d2'
```

Para sobrescribir el fingerprinting en un boundary concreto, pasa la prop `fingerprint`:

```tsx
<ErrorBoundary
  // custom fingerprint: combines the error name and message
  fingerprint={(error) => `${error.name}:${error.message}`}
  fallback={<p>Error</p>}
>
  <Widget />
</ErrorBoundary>
```

La prop `fingerprint` es respetada tanto por el contextBuilder por defecto como por `buildErrorContext`.

## `getBreadcrumbTrail` — acceso directo al singleton

```ts
import { getBreadcrumbTrail } from 'react-rescuer/observability'

// Gets (and starts if not yet created) the BreadcrumbTrail singleton
const trail = getBreadcrumbTrail()

// Available methods:
trail.add({ type: 'custom', message: 'payment initiated' }) // adds an entry
trail.get()                                                 // Breadcrumb[] — copy of current state
trail.clear()                                               // empties the trail
trail.stop()                                                // removes all event listeners
trail.start()                                               // re-installs the listeners
```

### `BreadcrumbTrail` como clase

Si necesitas instancias independientes (por ejemplo, para aislar distintas áreas de la app):

```ts
import { BreadcrumbTrail } from 'react-rescuer/observability'

const trail = new BreadcrumbTrail()
trail.start() // installs listeners (click, pushState, replaceState, popstate)

// Pass it to the boundary via getBreadcrumbs
<ErrorBoundary
  contextBuilder={buildErrorContext}
  getBreadcrumbs={() => trail.get()}
  fallback={<p>Error</p>}
>
  <IsolatedSection />
</ErrorBoundary>
```

## Reset de breadcrumbs

Los breadcrumbs se limpian automáticamente cuando cualquier boundary se resetea. El boundary dispara el evento DOM `react-rescuer:reset`, al que el singleton está suscrito.

Puedes limpiarlo manualmente también:

```ts
// via the trail API
getBreadcrumbTrail().clear()

// via the DOM event (useful if you don't have direct access to the trail)
window.dispatchEvent(new CustomEvent('react-rescuer:reset'))
```

## `contextBuilder` personalizado

Si necesitas control total sobre la construcción del contexto:

```tsx
import type { ErrorBoundaryProps } from 'react-rescuer'

const myContextBuilder: NonNullable<ErrorBoundaryProps['contextBuilder']> = (
  error,
  info,
  { sessionId, errorCount, retryCount, boundaryProps, getBreadcrumbs, fingerprint }
) => ({
  error,
  fingerprint   : fingerprint?.(error) ?? myHashFn(error),
  breadcrumbs   : getBreadcrumbs?.() ?? [],
  componentStack: (info.componentStack ?? '').trim(),
  sessionId,
  errorCount,
  timestamp     : Date.now(),
  // boundaryProps is available if you want to include it
})

<ErrorBoundary contextBuilder={myContextBuilder} fallback={<p>Error</p>}>
  <Page />
</ErrorBoundary>
```
