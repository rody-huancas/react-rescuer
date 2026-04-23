import { useState } from "react";
import { ErrorBoundary } from "react-rescuer";
import { ExampleShell } from "../ui/ExampleShell";
import { Button, Callout, Row, Small, Stack } from "../ui/primitives";

const Flaky = ({ fail }: { fail: boolean }) => {
  if (fail) throw new Error("RetryExample failure");
  return <div>Recovered.</div>;
};

export const RetryExample = () => {
  const [fail, setFail] = useState(true);
  return (
    <ExampleShell
      title="Recovery / Retries"
      lead="The boundary can auto-recover with a controlled retry button and backoff." 
      imports={`import { ErrorBoundary } from "react-rescuer";`}
      api={[
        { name: "recovery.maxRetries", detail: "caps how many retries are allowed." },
        { name: "recovery.retryDelay", detail: "adds a delay before reset (number or function(attempt))." },
        { name: "retryCount", detail: "fallbackRender receives current retry count." },
        { name: "resetError", detail: "fallbackRender receives reset function used by the retry button." }
      ]}
      tryIt={["Toggle fail to control whether the child throws.", "When it throws, click Retry and watch retryCount."]}
    >
      <Stack $gap={12}>
        <Row>
          <Button type="button" $variant="ghost" onClick={() => setFail((v) => !v)}>
            Toggle fail
          </Button>
          <Small>fail: {String(fail)}</Small>
        </Row>

        <ErrorBoundary
          recovery={{
            maxRetries: 3,
            retryDelay: (attempt) => Math.min(1000, 200 * 2 ** (attempt - 1))
          }}
          fallbackRender={({ error, resetError, retryCount }) => (
            <Callout $tone="danger">
              <Stack $gap={8}>
                <div>
                  <strong>Caught:</strong> {error.message}
                </div>
                <Small>retryCount: {retryCount}</Small>
                <div>
                  <Button type="button" $variant="primary" onClick={resetError}>
                    Retry
                  </Button>
                </div>
              </Stack>
            </Callout>
          )}
        >
          <Flaky fail={fail} />
        </ErrorBoundary>
      </Stack>
    </ExampleShell>
  );
};
