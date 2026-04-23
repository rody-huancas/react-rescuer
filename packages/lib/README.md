# react-rescuer

<p>
  <a href="https://github.com/rody-huancas/react-rescuer">
    <img src="https://raw.githubusercontent.com/rody-huancas/react-rescuer/develop/packages/playground/public/logo-react-rescuer.webp" alt="react-rescuer" width="520" />
  </a>
</p>

Smart React error boundaries with recovery, observability, and DX.

- Repository: https://github.com/rody-huancas/react-rescuer
- Author: https://github.com/rody-huancas
- Star the repo: https://github.com/rody-huancas/react-rescuer/stargazers

## Install

```bash
pnpm add react-rescuer
```

Peer deps:

- `react` >= 18
- `react-dom` >= 18

## Quick start

```tsx
import { ErrorBoundary } from "react-rescuer";

export const App = () => (
  <ErrorBoundary fallback={<div>Something went wrong.</div>}>
    <Page />
  </ErrorBoundary>
);
```

## Reset + retry

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

## Events / async errors

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
  <ErrorBoundary fallback={<div>Fallback</div>}>
    <Raise />
  </ErrorBoundary>
);
```

## Observability (optional)

```tsx
import { ErrorBoundary } from "react-rescuer";
import { addBreadcrumb, buildErrorContext } from "react-rescuer/observability";

export const Demo = () => (
  <ErrorBoundary
    contextBuilder={buildErrorContext}
    onError={(error, _info, ctx) => {
      console.log("ErrorContext", { error, ctx });
    }}
    fallback={<div>Check the console</div>}
  >
    <button
      type="button"
      onClick={() => {
        addBreadcrumb({ type: "custom", message: "user clicked" });
      }}
    >
      Add breadcrumb
    </button>
  </ErrorBoundary>
);
```

## Reporting

v0.1.0 does not ship official reporters. Use `onError(error, info, errorContext)` to integrate with any tool.

## License

MIT
