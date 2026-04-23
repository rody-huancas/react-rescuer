<p align="center">
  <a href="https://github.com/rody-huancas/react-rescuer">
    <img src="packages/playground/public/logo-react-rescuer.webp" alt="react-rescuer" width="520" />
  </a>
</p>

# react-rescuer

[![CI](https://img.shields.io/github/actions/workflow/status/rody-huancas/react-rescuer/ci.yml?branch=develop)](https://github.com/rody-huancas/react-rescuer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Smart React error boundaries with recovery, observability, and DX.

Links:

- Repository: https://github.com/rody-huancas/react-rescuer
- Author: https://github.com/rody-huancas

If this project helps you, consider starring the repo:

- https://github.com/rody-huancas/react-rescuer/stargazers

---

## Monorepo

This repo is a pnpm workspace:

- `packages/lib` - the published npm package: `react-rescuer`
- `packages/playground` - a Vite + React app for manual testing

---

## Install

```bash
pnpm add react-rescuer
```

Peer deps:

- `react` >= 18
- `react-dom` >= 18

---

## Quick start

```tsx
import { ErrorBoundary } from "react-rescuer";

export const App = () => (
  <ErrorBoundary fallback={<div>Something went wrong.</div>}>
    <Page />
  </ErrorBoundary>
);
```

Want the error details and a reset button?

```tsx
import { ErrorBoundary } from "react-rescuer";

export const App = () => (
  <ErrorBoundary
    fallbackRender={({ error, resetError, retryCount }) => (
      <div>
        <div>{error.message}</div>
        <div>retryCount: {retryCount}</div>
        <button type="button" onClick={resetError}>
          Retry
        </button>
      </div>
    )}
  >
    <Page />
  </ErrorBoundary>
);
```

---

## Usage patterns

<details>
  <summary><strong>1) Automatic reset with resetKeys</strong></summary>

`resetKeys` works like in react-error-boundary: when the array changes, the boundary resets.

```tsx
import { useState } from "react";
import { ErrorBoundary } from "react-rescuer";

const Bomb = ({ armed }: { armed: boolean }) => {
  if (armed) throw new Error("boom");
  return <div>OK</div>;
};

export const Demo = () => {
  const [armed, setArmed] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setArmed(true)}>Throw</button>
      <button type="button" onClick={() => setArmed(false)}>Reset</button>

      <ErrorBoundary resetKeys={[armed]} fallback={<div>Fallback</div>}>
        <Bomb armed={armed} />
      </ErrorBoundary>
    </div>
  );
};
```

</details>

<details>
  <summary><strong>2) Errors from events / async code (useErrorBoundary)</strong></summary>

Boundaries catch render-time errors. For event handlers (click, async, promises), use `useErrorBoundary()`.

```tsx
import { ErrorBoundary } from "react-rescuer";
import { useErrorBoundary } from "react-rescuer/hooks";

const Raise = () => {
  const { showBoundary } = useErrorBoundary();

  return (
    <button type="button" onClick={() => showBoundary(new Error("from a handler"))}>
      Throw via hook
    </button>
  );
};

export const Demo = () => (
  <ErrorBoundary fallback={<div>Fallback: caught via hook</div>}>
    <Raise />
  </ErrorBoundary>
);
```

</details>

<details>
  <summary><strong>3) Observability (contextBuilder + breadcrumbs)</strong></summary>

Opt in by injecting `contextBuilder={buildErrorContext}`.

```tsx
import { ErrorBoundary } from "react-rescuer";
import { addBreadcrumb, buildErrorContext } from "react-rescuer/observability";

export const Demo = () => (
  <ErrorBoundary
    contextBuilder={buildErrorContext}
    onError={(error, _info, ctx) => {
      // ctx includes fingerprint, breadcrumbs, componentStack, sessionId, etc.
      console.log("ErrorContext", { error, ctx });
    }}
    fallback={<div>Check the console</div>}
  >
    <button
      type="button"
      onClick={() => {
        addBreadcrumb({ type: "custom", message: "user clicked" });
        // For event errors: use showBoundary() (see the hook example).
      }}
    >
      Add breadcrumb
    </button>
  </ErrorBoundary>
);
```

</details>

<details>
  <summary><strong>4) Recovery / retries</strong></summary>

Provide a recovery strategy via `recovery`.

```tsx
import { ErrorBoundary } from "react-rescuer";

export const Demo = () => (
  <ErrorBoundary
    recovery={{
      maxRetries: 3,
      retryDelay: (attempt) => Math.min(1000, 200 * 2 ** (attempt - 1))
    }}
    fallbackRender={({ error, resetError, retryCount }) => (
      <div>
        <div>{error.message}</div>
        <div>retryCount: {retryCount}</div>
        <button type="button" onClick={resetError}>Retry</button>
      </div>
    )}
  >
    <Page />
  </ErrorBoundary>
);
```

</details>

---

## API (quick view)

Fallback props include:

- `error`: the thrown `Error`
- `errorContext`: structured context (fingerprint, breadcrumbs, componentStack, timestamp, sessionId, errorCount)
- `resetError()`: resets the boundary (also dispatches `react-rescuer:reset` to clear breadcrumbs)
- `retryCount`: retry counter (when using `recovery`)

Reporting hook:

```ts
onError?: (error, errorInfo, errorContext) => void
```

Note: v0.1.0 does not ship official reporters. Use `onError` to integrate with any tool.

---

## Playground (interactive demos)

```bash
pnpm install
pnpm --filter playground dev
```

---

## Contributing

This repo uses:

- PRs target `develop`
- Conventional Commits
- Strict policy: 1 file = 1 commit

See `CONTRIBUTING.md`.

---

## License

MIT
