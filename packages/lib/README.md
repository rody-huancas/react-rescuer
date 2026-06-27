# react-rescuer

<p>
  <a href="https://github.com/rody-huancas/react-rescuer">
    <img src="https://raw.githubusercontent.com/rody-huancas/react-rescuer/develop/packages/playground/public/logo-react-rescuer.webp" alt="react-rescuer" width="520" />
  </a>
</p>

**Error boundaries for React 18 — with automatic recovery, observability, and zero config DevOverlay.**

[![npm](https://img.shields.io/npm/v/react-rescuer)](https://www.npmjs.com/package/react-rescuer)
[![CI](https://img.shields.io/github/actions/workflow/status/rody-huancas/react-rescuer/ci.yml?branch=develop)](https://github.com/rody-huancas/react-rescuer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/rody-huancas/react-rescuer/blob/main/LICENSE)

## Why react-rescuer?

React's built-in error boundaries catch render errors — and that's it. react-rescuer adds automatic retry with backoff, structured observability (breadcrumbs, fingerprinting, session tracking), a zero-config DevOverlay in development, and testing utilities. All opt-in, zero config to start.

## Install

```bash
npm i react-rescuer
# pnpm add react-rescuer  |  yarn add react-rescuer  |  bun add react-rescuer
```

Peer deps: `react >= 18`, `react-dom >= 18`

## Quick start

```tsx
import { ErrorBoundary } from "react-rescuer";

export function App() {
  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <Page />
    </ErrorBoundary>
  );
}
```

That's it for the happy path. Everything below is opt-in.

## Features

### Fallback UI

Three modes — pick the one that fits:

```tsx
// static node
<ErrorBoundary fallback={<p>Error</p>}>

// render prop — access error + reset
<ErrorBoundary fallbackRender={({ error, resetError }) => (
  <div>
    <p>{error.message}</p>
    <button onClick={resetError}>Retry</button>
  </div>
)}>

// component
<ErrorBoundary FallbackComponent={MyFallback}>
```

`FallbackProps` received by `fallbackRender` / `FallbackComponent`:

```ts
type FallbackProps = {
  error: Error;
  errorContext: ErrorContext; // fingerprint, breadcrumbs, sessionId, …
  resetError: () => void;
  retryCount: number;
};
```

### Automatic recovery

Pass a `recovery` prop to retry automatically with exponential backoff:

```tsx
import { ErrorBoundary } from "react-rescuer";

<ErrorBoundary
  recovery={{
    maxRetries: 3,
    retryDelay: (attempt) => Math.min(8000, 250 * 2 ** (attempt - 1)), // 250 → 500 → 1000 …
    isRecoverable: (error) => error.name !== "FatalError",
    onMaxRetriesReached: (error, ctx) => reportToSentry(error, ctx),
  }}
  fallbackRender={({ error, retryCount }) => (
    <p>
      {error.message} — attempt {retryCount}
    </p>
  )}
>
  <DataWidget />
</ErrorBoundary>;
```

For orchestrating retries across multiple boundaries, use `RetryManager` from `react-rescuer/recovery`:

```ts
import { RetryManager, createExponentialBackoff } from "react-rescuer/recovery";

const manager = new RetryManager(
  { maxRetries: 5 },
  createExponentialBackoff(250, 10_000),
);

const { ok, delayMs } = manager.next("widget-boundary", error, context);
```

### Observability

Every error gives you a structured `ErrorContext` out of the box:

```ts
type ErrorContext = {
  error: Error;
  fingerprint: string; // stable hash across deploys
  breadcrumbs: Breadcrumb[]; // last 20 user actions before the crash
  componentStack: string;
  sessionId: string;
  errorCount: number;
  timestamp: number;
};
```

Auto-capture clicks and navigation events, then attach them to the boundary:

```tsx
import { ErrorBoundary } from "react-rescuer";
import { addBreadcrumb, buildErrorContext } from "react-rescuer/observability";

// manually add a breadcrumb anywhere in your app
addBreadcrumb({ type: "custom", message: "user submitted form" });

<ErrorBoundary
  contextBuilder={buildErrorContext}
  onError={(error, _info, ctx) => {
    sendToMonitoring({ error, ctx }); // fingerprint + breadcrumbs included
  }}
  fallback={<p>Something went wrong.</p>}
>
  <CheckoutForm />
</ErrorBoundary>;
```

`getBreadcrumbTrail()` auto-starts on first call and captures `click`, `pushState`, `replaceState`, and `popstate`. Breadcrumbs clear on boundary reset.

### DevOverlay

In `development`, `ErrorBoundary` automatically renders a built-in overlay with the error, stack, component tree, retries left, and breadcrumbs. No setup needed — it tree-shakes to zero in production.

### Async errors

React's `componentDidCatch` only catches render-time errors. Use `useErrorBoundary` to route async or event-handler errors into the nearest boundary:

```tsx
import { ErrorBoundary } from "react-rescuer";
import { useErrorBoundary } from "react-rescuer/hooks";

function SaveButton() {
  const { showBoundary } = useErrorBoundary();

  return (
    <button
      onClick={async () => {
        try {
          await api.save();
        } catch (e) {
          showBoundary(e as Error);
        }
      }}
    >
      Save
    </button>
  );
}

<ErrorBoundary fallback={<p>Save failed.</p>}>
  <SaveButton />
</ErrorBoundary>;
```

### HOC

```tsx
import { withErrorBoundary } from "react-rescuer/hoc";

const SafeWidget = withErrorBoundary(Widget, {
  fallback: <p>Widget failed to load.</p>,
});
```

### Testing

```tsx
import { render } from "@testing-library/react";
import { createTestBoundary, installMatchers } from "react-rescuer/testing";

installMatchers(); // adds toHaveCaughtError + toHaveCaughtErrorMatching to expect

const tb = createTestBoundary();
const { Boundary, getLastContext } = tb;

function Bomb() {
  throw new Error("boom");
  return null;
}

render(
  <Boundary>
    <Bomb />
  </Boundary>,
);

expect(tb).toHaveCaughtError();
expect(tb).toHaveCaughtErrorMatching("boom");
expect(getLastContext()?.fingerprint).toBeTruthy();
```

## Import paths

```ts
import { ErrorBoundary } from "react-rescuer";
import { withErrorBoundary } from "react-rescuer/hoc";
import { useErrorBoundary, useErrorContext } from "react-rescuer/hooks";
import { createTestBoundary, installMatchers } from "react-rescuer/testing";
import { RetryManager, createExponentialBackoff } from "react-rescuer/recovery";
import { addBreadcrumb, buildErrorContext, fingerprintError, getBreadcrumbTrail } from "react-rescuer/observability";
```

## Documentation

Full API reference and advanced recipes → [DOCUMENTATION.md](https://github.com/rody-huancas/react-rescuer/blob/main/DOCUMENTATION.md)

## Contributing

Issues and PRs welcome. See the [repository](https://github.com/rody-huancas/react-rescuer) for setup instructions.

## License

MIT © [Rody Huancas](https://github.com/rody-huancas)
