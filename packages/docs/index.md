---
layout: home

hero:
  name: react-rescuer
  text: Error boundaries that recover.
  tagline: Automatic retry with backoff, structured observability, zero-config DevOverlay, and testing utilities — all opt-in, zero config to start.
  actions:
    - theme: brand
      text: Get Started →
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/rody-huancas/react-rescuer

features:
  - icon: 🔄
    title: Automatic Recovery
    details: Built-in retry with configurable backoff. Set maxRetries and retryDelay — the boundary retries and resets itself.
  - icon: 🔍
    title: Observability
    details: Every error ships with a stable fingerprint, the last 20 user actions as breadcrumbs, a sessionId, and the full componentStack.
  - icon: 🛠️
    title: DevOverlay
    details: Zero-config error panel in development. Shows stack, component tree, breadcrumbs, and retries remaining. Tree-shakes to zero in production.
  - icon: 🧪
    title: Testing Utilities
    details: createTestBoundary() + custom matchers (toHaveCaughtError, toHaveCaughtErrorMatching) for vitest and jest.
  - icon: ⚡
    title: Async Errors
    details: useErrorBoundary() routes errors from event handlers and async code into the nearest boundary — React can't do this natively.
  - icon: 🔷
    title: TypeScript First
    details: Full type inference. Generic ErrorBoundary<E extends Error> lets you narrow the caught error type inside your fallback.
---
