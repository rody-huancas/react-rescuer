# Getting Started

## Installation

```bash
npm i react-rescuer
# pnpm add react-rescuer  |  yarn add react-rescuer  |  bun add react-rescuer
```

**Peer dependencies:** `react >= 18`, `react-dom >= 18`

## Quick start

Wrap any subtree with `ErrorBoundary`. The `fallback` prop accepts any React node:

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

That's the minimum. Everything else — recovery, observability, DevOverlay — is opt-in.

## Import paths

The library is split into six entry points so you only bundle what you use:

```ts
import { ErrorBoundary } from "react-rescuer";
import { withErrorBoundary } from "react-rescuer/hoc";
import { useErrorBoundary, useErrorContext } from "react-rescuer/hooks";
import { createTestBoundary, installMatchers } from "react-rescuer/testing";
import { RetryManager, createExponentialBackoff } from "react-rescuer/recovery";
import { addBreadcrumb, buildErrorContext, fingerprintError, getBreadcrumbTrail } from "react-rescuer/observability";
```

## Next steps

- [Fallback UI](/guide/fallback) — three fallback modes and reset patterns
- [Automatic Recovery](/guide/recovery) — retry with backoff
- [Observability](/guide/observability) — breadcrumbs, fingerprinting, sessionId
- [Async Errors](/guide/async-errors) — `useErrorBoundary` for events and async code
- [Testing](/guide/testing) — test utilities and custom matchers
