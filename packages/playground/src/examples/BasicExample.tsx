import { useState } from "react";
import { ErrorBoundary } from "react-rescuer";

function Bomb({ armed }: { armed: boolean }) {
  if (armed) throw new Error("BasicExample explosion");
  return <div>All good.</div>;
}

export function BasicExample() {
  const [armed, setArmed] = useState(false);
  return (
    <div>
      <h2 style={{ margin: 0, fontSize: 16 }}>Basic ErrorBoundary</h2>
      <p style={{ marginTop: 8, color: "#4b5563" }}>
        Click to throw, then reset by changing resetKeys.
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
          fallbackRender={({ error, errorContext }) => (
            <div>
              <div style={{ fontWeight: 700 }}>Caught:</div>
              <div>{error.message}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                fingerprint: {errorContext.fingerprint}
              </div>
            </div>
          )}
        >
          <Bomb armed={armed} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
