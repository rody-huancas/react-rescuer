import { ErrorBoundary } from "react-rescuer";
import { useErrorBoundary } from "react-rescuer/hooks";

function HookBomb() {
  const { showBoundary } = useErrorBoundary();
  return (
    <button
      type="button"
      onClick={() => {
        showBoundary(new Error("HookExample thrown via hook"));
      }}
    >
      Throw via hook
    </button>
  );
}

export function HookExample() {
  return (
    <div>
      <h2 style={{ margin: 0, fontSize: 16 }}>useErrorBoundary()</h2>
      <p style={{ marginTop: 8, color: "#4b5563" }}>
        Throws to the nearest ErrorBoundary.
      </p>

      <ErrorBoundary fallback={<div>Fallback caught hook error.</div>}>
        <HookBomb />
      </ErrorBoundary>
    </div>
  );
}
