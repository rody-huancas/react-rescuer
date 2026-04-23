import { useState } from "react";
import { ErrorBoundary } from "react-rescuer";
import { ExampleShell } from "../ui/ExampleShell";
import { Button, Callout, Row, Small, Stack } from "../ui/primitives";

const Bomb = ({ armed }: { armed: boolean }) => {
  if (armed) throw new Error("BasicExample explosion");
  return <div>All good.</div>;
};

export const BasicExample = () => {
  const [armed, setArmed] = useState(false);
  return (
    <ExampleShell
      title="Basic ErrorBoundary"
      lead="A minimal boundary using fallbackRender, plus automatic reset via resetKeys."
      imports={`import { ErrorBoundary } from "react-rescuer";`}
      api={[
        { name: "fallbackRender", detail: "render prop fallback; receives error + errorContext." },
        { name: "resetKeys", detail: "when this array changes, the boundary resets automatically." }
      ]}
      tryIt={["Click Throw to crash the subtree.", "Click Reset to flip resetKeys and recover."]}
    >
      <Stack $gap={12}>
        <Row>
          <Button type="button" $variant="primary" onClick={() => setArmed(true)}>
            Throw
          </Button>
          <Button type="button" $variant="ghost" onClick={() => setArmed(false)}>
            Reset
          </Button>
          <Small>armed: {String(armed)}</Small>
        </Row>

        <ErrorBoundary
          resetKeys={[armed]}
          fallbackRender={({ error, errorContext }) => (
            <Callout $tone="danger">
              <Stack $gap={6}>
                <div>
                  <strong>Caught:</strong> {error.message}
                </div>
                <Small>fingerprint: {errorContext.fingerprint}</Small>
              </Stack>
            </Callout>
          )}
        >
          <Bomb armed={armed} />
        </ErrorBoundary>
      </Stack>
    </ExampleShell>
  );
};
