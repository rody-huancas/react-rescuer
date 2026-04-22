import { useMemo, useState } from "react";
import { HookExample } from "./examples/HookExample";
import { BasicExample } from "./examples/BasicExample";
import { RetryExample } from "./examples/RetryExample";
import { ObservabilityExample } from "./examples/ObservabilityExample";

type DemoKey = "basic" | "retry" | "hook" | "observability";

export function App() {
  const [demo, setDemo] = useState<DemoKey>("basic");

  const Demo = useMemo(() => {
    switch (demo) {
      case "basic":
        return BasicExample;
      case "retry":
        return RetryExample;
      case "hook":
        return HookExample;
      case "observability":
        return ObservabilityExample;
      default:
        return BasicExample;
    }
  }, [demo]);

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        padding: 24,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 20 }}>react-rescuer playground</h1>
      <p style={{ marginTop: 8, color: "#4b5563" }}>
        Manual examples for core features.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <button type="button" onClick={() => setDemo("basic")}>
          Basic
        </button>
        <button type="button" onClick={() => setDemo("retry")}>
          Retry
        </button>
        <button type="button" onClick={() => setDemo("hook")}>
          Hook
        </button>
        <button type="button" onClick={() => setDemo("observability")}>
          Observability
        </button>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
        }}
      >
        <Demo />
      </div>
    </div>
  );
}
