import { useState } from "react";
import { ErrorBoundary } from "react-rescuer";

function Flaky({ fail }: { fail: boolean }) {
  if (fail) throw new Error("RetryExample failure");
  return <div>Recovered.</div>;
}

export function RetryExample() {
  const [fail, setFail] = useState(true);
  return (
    <div>
      <h2 style={{ margin: 0, fontSize: 16 }}>Recovery / Retries</h2>
      <p style={{ marginTop: 8, color: "#4b5563" }}>
        The retry button waits before resetting.
      </p>

      <button type="button" onClick={() => setFail((v) => !v)}>
        Toggle fail (currently: {String(fail)})
      </button>

      <div style={{ marginTop: 12 }}>
        <ErrorBoundary
          recovery={{
            maxRetries: 3,
            retryDelay: (attempt) => Math.min(1000, 200 * 2 ** (attempt - 1)),
          }}
          fallbackRender={({ error, resetError, retryCount }) => (
            <div>
              <div style={{ fontWeight: 700 }}>Caught:</div>
              <div>{error.message}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                retryCount: {retryCount}
              </div>
              <button
                type="button"
                onClick={resetError}
                style={{ marginTop: 8 }}
              >
                Retry
              </button>
            </div>
          )}
        >
          <Flaky fail={fail} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
