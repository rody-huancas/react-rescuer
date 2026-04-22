import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-rescuer";
import { addBreadcrumb, buildErrorContext } from "react-rescuer/observability";

function Bomb({ armed }: { armed: boolean }) {
  if (armed) throw new Error("ObservabilityExample error");
  return <div>Waiting...</div>;
}

export function ObservabilityExample() {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    addBreadcrumb({ type: "custom", message: "ObservabilityExample mounted" });
  }, []);

  return (
    <div>
      <h2 style={{ margin: 0, fontSize: 16 }}>Observability</h2>
      <p style={{ marginTop: 8, color: "#4b5563" }}>
        Logs ErrorContext to console.
      </p>

      <button type="button" onClick={() => setArmed(true)}>
        Throw
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        style={{ marginLeft: 8 }}
      >
        Reset
      </button>

      <div style={{ marginTop: 12 }}>
        <ErrorBoundary
          resetKeys={[armed]}
          contextBuilder={buildErrorContext}
          onError={(_err, _info, ctx) => {
            console.log("ErrorContext", ctx);
          }}
          fallback={<div>Check console for ErrorContext.</div>}
        >
          <Bomb armed={armed} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
