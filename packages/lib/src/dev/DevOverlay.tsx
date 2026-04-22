import { useMemo } from "react";

import type { FallbackProps } from "../core/types";

function filterStack(stack: string | undefined) {
  if (!stack) return "";
  return stack
    .split("\n")
    .filter((l) => {
      const line = l.trim();
      if (!line) return false;
      if (line.includes("node_modules/react")) return false;
      if (line.includes("react-dom")) return false;
      if (line.includes("scheduler")) return false;
      return true;
    })
    .join("\n");
}

function getMaxRetries(boundaryProps: unknown): number | null {
  if (!boundaryProps || typeof boundaryProps !== "object") return null;

  const r = (boundaryProps as Record<string, unknown>).recovery;

  if (!r || typeof r !== "object") return null;

  const max = (r as Record<string, unknown>).maxRetries;
  return typeof max === "number" && Number.isFinite(max) ? max : null;
}

export function DevOverlay<E extends Error = Error>(props: FallbackProps<E>) {
  const { error, errorContext, retryCount, resetError } = props;

  const cleanedStack = useMemo(() => filterStack(error.stack), [error.stack]);
  
  const maxRetries = useMemo(
    () => getMaxRetries(errorContext.boundaryProps),
    [errorContext.boundaryProps],
  );
  const remaining = maxRetries == null ? null : Math.max(0, maxRetries - retryCount);

  return (
    <div
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        padding: 16,
        border: "1px solid #e11d48",
        background: "#fff1f2",
        color: "#111827",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            react-rescuer dev overlay
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {error.name}: {error.message}
          </div>
          {remaining != null ? (
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              retries left: {remaining}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={resetError}
          style={{
            border: "1px solid #111827",
            background: "#111827",
            color: "white",
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          retry
        </button>
      </div>

      {cleanedStack ? (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 12, fontSize: 12 }}>
          {cleanedStack}
        </pre>
      ) : null}

      {errorContext.componentStack ? (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            marginTop: 12,
            fontSize: 12,
            opacity: 0.9,
          }}
        >
          {errorContext.componentStack}
        </pre>
      ) : null}

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700 }}>breadcrumbs</div>
        <ol style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12 }}>
          {errorContext.breadcrumbs.map((b, i) => (
            <li key={`${b.timestamp}-${i}`}>
              [{b.type}] {b.message ?? ""}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
