# Testing

`react-rescuer/testing` exporta helpers para testear error boundaries con vitest (y jest) sin boilerplate.

## Setup — `installMatchers`

Llama a `installMatchers()` una sola vez en tu archivo de setup de tests. Extiende `expect` globalmente con los dos matchers personalizados:

```ts
// vitest.setup.ts
import { installMatchers } from 'react-rescuer/testing'

installMatchers()
```

Regístralo en tu `vitest.config.ts`:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles : ['./vitest.setup.ts'],
    globals    : true,
  },
})
```

## `createTestBoundary`

Crea un boundary preconfigurado con captores de estado. Devuelve cuatro utilidades:

```ts
import { createTestBoundary } from 'react-rescuer/testing'

const tb = createTestBoundary()
//    ^-- { Boundary, getLastError, getLastContext, reset }
```

| Campo | Tipo | Descripción |
|---|---|---|
| `Boundary` | `ComponentType` | Envuelve el árbol bajo test |
| `getLastError()` | `() => Error \| null` | Último error capturado, o `null` si no hay ninguno |
| `getLastContext()` | `() => ErrorContext \| null` | Último `ErrorContext` construido, o `null` |
| `reset()` | `() => void` | Llama a `resetError()` en el boundary activo |

## Test básico con matchers

```tsx
import { render, screen } from '@testing-library/react'
import { createTestBoundary, installMatchers } from 'react-rescuer/testing'

installMatchers()

// Component that always throws during render
function Bomb(): never {
  throw new Error('Something went wrong')
}

describe('ErrorBoundary', () => {
  test('captura el error y lo expone por getLastError', () => {
    const tb = createTestBoundary()

    render(
      <tb.Boundary>
        <Bomb />
      </tb.Boundary>
    )

    // Asserts that the boundary caught something
    expect(tb).toHaveCaughtError()

    // Matches the error message (string → substring, RegExp → test)
    expect(tb).toHaveCaughtErrorMatching('Something went wrong')
    expect(tb).toHaveCaughtErrorMatching(/went wrong/i)

    // Direct access to the error and context
    expect(tb.getLastError()).toBeInstanceOf(Error)
    expect(tb.getLastContext()?.fingerprint).toBeTruthy()
    expect(tb.getLastContext()?.sessionId).toMatch(/^rr_/)
  })

  test('no captura nada cuando los children renderizan bien', () => {
    const tb = createTestBoundary()

    render(
      <tb.Boundary>
        <div>All good</div>
      </tb.Boundary>
    )

    expect(screen.getByText('All good')).toBeInTheDocument()
    expect(tb).not.toHaveCaughtError()
    expect(tb.getLastError()).toBeNull()
  })
})
```

## Matchers disponibles

### `toHaveCaughtError()`

Pasa cuando el boundary ha capturado al menos un error en su estado actual:

```ts
expect(tb).toHaveCaughtError()        // there must be a caught error
expect(tb).not.toHaveCaughtError()    // there must be none
```

### `toHaveCaughtErrorMatching(pattern)`

Pasa cuando el mensaje del error capturado coincide con el patrón:

```ts
expect(tb).toHaveCaughtErrorMatching('network')          // substring
expect(tb).toHaveCaughtErrorMatching(/5\d\d/)            // RegExp
expect(tb).not.toHaveCaughtErrorMatching('auth')         // negation
```

## Pasar opciones al boundary

`createTestBoundary` acepta cualquier `Partial<ErrorBoundaryProps>`. Úsalo para testear recovery, callbacks, o cualquier prop:

```tsx
test('llama onError con el contexto correcto', () => {
  const onError = vi.fn()

  // The test boundary inherits all props you pass
  const tb = createTestBoundary({ onError })

  render(
    <tb.Boundary>
      <Bomb />
    </tb.Boundary>
  )

  expect(onError).toHaveBeenCalledTimes(1)

  const [error, , ctx] = onError.mock.calls[0]
  expect(error).toBeInstanceOf(Error)
  expect(typeof ctx.fingerprint).toBe('string')
  expect(ctx.errorCount).toBe(1)
})
```

## Testear el reset

```tsx
import { render, screen } from '@testing-library/react'
import { useState } from 'react'

function MaybeThrow({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('boom')
  return <div>recovered</div>
}

test('se recupera después de reset', () => {
  const tb = createTestBoundary()

  // First render: throws
  const { rerender } = render(
    <tb.Boundary>
      <MaybeThrow shouldThrow />
    </tb.Boundary>
  )

  expect(tb).toHaveCaughtError()

  // Reset the boundary
  tb.reset()

  // Second render: does not throw — children appear again
  rerender(
    <tb.Boundary>
      <MaybeThrow shouldThrow={false} />
    </tb.Boundary>
  )

  expect(screen.getByText('recovered')).toBeInTheDocument()
  expect(tb).not.toHaveCaughtError()
  expect(tb.getLastError()).toBeNull()
})
```

## Testear con recovery

```tsx
import { vi } from 'vitest'

test('llama onMaxRetriesReached tras agotar reintentos', () => {
  const onMaxRetriesReached = vi.fn()

  const tb = createTestBoundary({
    recovery: {
      maxRetries          : 2,
      retryDelay          : 0,   // 0 ms so the test doesn't wait
      onMaxRetriesReached,
    },
  })

  render(
    <tb.Boundary>
      <Bomb />
    </tb.Boundary>
  )

  expect(tb).toHaveCaughtError()

  // Simulate the two retries
  tb.reset() // attempt 1
  tb.reset() // attempt 2

  expect(onMaxRetriesReached).toHaveBeenCalledTimes(1)
})
```

## TypeScript — tipado de los matchers

Los matchers personalizados no están en el `@types` de vitest por defecto. Añade la declaración de tipos en tu proyecto:

```ts
// vitest.d.ts (or any .d.ts file included in tsconfig)
import type { createTestBoundary } from 'react-rescuer/testing'

type TestBoundaryResult = ReturnType<typeof createTestBoundary>

interface CustomMatchers<R = unknown> {
  toHaveCaughtError(): R
  toHaveCaughtErrorMatching(pattern: RegExp | string): R
}

declare module 'vitest' {
  interface Assertion<T = TestBoundaryResult> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
```
