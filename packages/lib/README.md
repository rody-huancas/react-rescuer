# react-rescuer

<p>
  <a href="https://github.com/rody-huancas/react-rescuer">
    <img src="https://raw.githubusercontent.com/rody-huancas/react-rescuer/develop/packages/playground/public/logo-react-rescuer.webp" alt="react-rescuer" width="520" />
  </a>
</p>

Smart React error boundaries with recovery, observability, and DX.

[![npm](https://img.shields.io/npm/v/react-rescuer)](https://www.npmjs.com/package/react-rescuer)
[![CI](https://img.shields.io/github/actions/workflow/status/rody-huancas/react-rescuer/ci.yml?branch=develop)](https://github.com/rody-huancas/react-rescuer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/rody-huancas/react-rescuer/blob/develop/LICENSE)

- Repository: https://github.com/rody-huancas/react-rescuer
- Author: https://github.com/rody-huancas
- Star the repo: https://github.com/rody-huancas/react-rescuer/stargazers

## What you get

- Catch render-time errors with a familiar `ErrorBoundary`
- Reset patterns: `resetError()` + `resetKeys`
- Optional retries with delays/backoff (`recovery`)
- Structured `ErrorContext` for fallbacks (fingerprint, breadcrumbs, component stack, session id)
- Optional observability helpers (breadcrumbs + fingerprint + `buildErrorContext`)
- Development overlay in dev, your fallback in prod

## Install

npm

```bash
npm i react-rescuer
```

pnpm

```bash
pnpm add react-rescuer
```

yarn

```bash
yarn add react-rescuer
```

bun

```bash
bun add react-rescuer
```

Peer deps:

- `react` >= 18
- `react-dom` >= 18

## 30-second setup

1) Wrap a page/route/section with `ErrorBoundary`

```tsx
import { ErrorBoundary } from "react-rescuer";

export function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong.</div>}>
      <Page />
    </ErrorBoundary>
  );
}
```

2) Use a real fallback UI and call `resetError()`

```tsx
import { ErrorBoundary } from "react-rescuer";
import type { FallbackProps } from "react-rescuer";

function Fallback({ error, resetError }: FallbackProps) {
  return (
    <div role="alert">
      <div>Oops:</div>
      <pre>{error.message}</pre>
      <button type="button" onClick={resetError}>
        Try again
      </button>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      <Page />
    </ErrorBoundary>
  );
}
```

3) Report errors (optional)

```tsx
import { ErrorBoundary } from "react-rescuer";

export function App() {
  return (
    <ErrorBoundary
      onError={(error, _info, ctx) => {
        // send to Sentry, Datadog, Logtail, your API, etc.
        console.log("caught", { error, ctx });
      }}
      fallback={<div>Something went wrong.</div>}
    >
      <Page />
    </ErrorBoundary>
  );
}
```

## Common recipes

Automatic reset with `resetKeys`:

```tsx
import { useState } from "react";
import { ErrorBoundary } from "react-rescuer";

function Bomb({ armed }: { armed: boolean }) {
  if (armed) throw new Error("boom");
  return <div>OK</div>;
}

export function Demo() {
  const [armed, setArmed] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setArmed(true)}>
        Throw
      </button>
      <button type="button" onClick={() => setArmed(false)}>
        Reset
      </button>

      <ErrorBoundary resetKeys={[armed]} fallback={<div>Fallback</div>}>
        <Bomb armed={armed} />
      </ErrorBoundary>
    </div>
  );
}
```

Errors from events / async code (use `useErrorBoundary()`):

```tsx
import { ErrorBoundary } from "react-rescuer";
import { useErrorBoundary } from "react-rescuer/hooks";

function SaveButton() {
  const { showBoundary } = useErrorBoundary();

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await fetch("/api/save");
          throw new Error("simulate async error");
        } catch (e) {
          showBoundary(e as Error);
        }
      }}
    >
      Save
    </button>
  );
}

export function Demo() {
  return (
    <ErrorBoundary fallback={<div>Fallback</div>}>
      <SaveButton />
    </ErrorBoundary>
  );
}
```

Retries with `recovery`:

```tsx
import { ErrorBoundary } from "react-rescuer";

export function Demo() {
  return (
    <ErrorBoundary
      recovery={{
        maxRetries: 3,
        retryDelay: (attempt) => Math.min(1000, 200 * 2 ** (attempt - 1)),
      }}
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
}
```

## API

`ErrorBoundary` props (high-signal)

```ts
type ErrorBoundaryProps<E extends Error = Error> = {
  children: React.ReactNode;

  // fallback UI (pick one)
  fallback?: React.ReactNode;
  fallbackRender?: (props: FallbackProps<E>) => React.ReactNode;
  FallbackComponent?: React.ComponentType<FallbackProps<E>>;

  // reset behavior
  resetKeys?: unknown[];
  onReset?: (details: { reason: "imperative" | "resetKeys" | "retry" }) => void;

  // reporting
  onError?: (error: E, errorInfo: React.ErrorInfo, errorContext: ErrorContext) => void;

  // retries (optional)
  recovery?: {
    maxRetries: number;
    retryDelay?: number | ((attempt: number, error: E) => number);
    isRecoverable?: (error: E) => boolean;
    onMaxRetriesReached?: (error: E, context: ErrorContext) => void;
  };

  // observability (optional)
  getBreadcrumbs?: () => Breadcrumb[];
  fingerprint?: (error: E) => string;
  contextBuilder?: (
    error: E,
    errorInfo: React.ErrorInfo,
    options: {
      sessionId: string;
      errorCount: number;
      retryCount: number;
      boundaryProps?: unknown;
      getBreadcrumbs?: () => Breadcrumb[];
      fingerprint?: (error: E) => string;
    },
  ) => ErrorContext;
};
```

Fallback props

```ts
type FallbackProps<E extends Error = Error> = {
  error: E;
  errorContext: ErrorContext;
  resetError: () => void;
  retryCount: number;
};
```

`ErrorContext` fields

```ts
type ErrorContext = {
  error: Error;
  fingerprint: string;
  breadcrumbs: Breadcrumb[];
  componentStack: string;
  timestamp: number;
  sessionId: string;
  errorCount: number;
  boundaryProps?: unknown;
};
```

## Observability (optional)

Recommended: inject `buildErrorContext` and use breadcrumbs.

```tsx
import { ErrorBoundary } from "react-rescuer";
import { addBreadcrumb, buildErrorContext } from "react-rescuer/observability";

export function Demo() {
  return (
    <ErrorBoundary
      contextBuilder={buildErrorContext}
      onError={(error, _info, ctx) => {
        console.log("ErrorContext", { error, ctx });
      }}
      fallback={<div>Check the console</div>}
    >
      <button
        type="button"
        onClick={() => addBreadcrumb({ type: "custom", message: "user clicked" })}
      >
        Add breadcrumb
      </button>
    </ErrorBoundary>
  );
}
```

Breadcrumbs clear on reset via a DOM event: `react-rescuer:reset`.

## Development overlay

In development (`process.env.NODE_ENV === "development"`), `ErrorBoundary` attempts to render a built-in overlay (via a conditional `require()` import). In production it renders your configured fallback.

## Testing

```ts
import { createTestBoundary, installMatchers } from "react-rescuer/testing";

installMatchers();

const testBoundary = createTestBoundary();
const { Boundary, getLastContext } = testBoundary;

// render(
//   <Boundary>
//     <Bomb />
//   </Boundary>
// )

// expect(testBoundary).toHaveCaughtError();
// expect(getLastContext()?.fingerprint).toBeTruthy();
```

## Import paths

```ts
import { ErrorBoundary } from "react-rescuer";

import { useErrorBoundary, useErrorContext } from "react-rescuer/hooks";
import { withErrorBoundary } from "react-rescuer/hoc";

import {
  addBreadcrumb,
  BreadcrumbTrail,
  buildErrorContext,
  fingerprintError,
  getBreadcrumbTrail,
} from "react-rescuer/observability";

import { RetryManager, createExponentialBackoff } from "react-rescuer/recovery";

import { createTestBoundary, installMatchers } from "react-rescuer/testing";
```

## License

MIT
