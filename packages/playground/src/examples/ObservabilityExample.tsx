import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-rescuer";
import { addBreadcrumb, buildErrorContext } from "react-rescuer/observability";
import { ExampleShell } from "../ui/ExampleShell";
import { Button, Callout, Row, Small, Stack } from "../ui/primitives";

const Bomb = ({ armed }: { armed: boolean }) => {
  if (armed) throw new Error("ObservabilityExample error");
  return <div>Waiting...</div>;
};

export const ObservabilityExample = () => {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    addBreadcrumb({ type: "custom", message: "ObservabilityExample mounted" });
  }, []);

  return (
    <ExampleShell
      title="Observability"
      lead="Opt-in observability by injecting a contextBuilder and capturing breadcrumbs."
      imports={`import { ErrorBoundary } from "react-rescuer";\nimport { addBreadcrumb, buildErrorContext } from "react-rescuer/observability";`}
      api={[
        { name: "contextBuilder", detail: "builds a rich ErrorContext (fingerprint, breadcrumbs, stacks, etc.)." },
        { name: "addBreadcrumb", detail: "pushes a breadcrumb into the shared trail." },
        { name: "onError", detail: "called when the boundary catches; gets the ErrorContext as third arg." }
      ]}
      tryIt={["Open DevTools console.", "Click Throw, then inspect the logged ErrorContext.", "Click Reset to clear state."]}
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

        <Callout>
          <Small>
            Tip: this example logs <strong>ErrorContext</strong> to the console.
          </Small>
        </Callout>

        <ErrorBoundary
          resetKeys={[armed]}
          contextBuilder={buildErrorContext}
          onError={(_err, _info, ctx) => {
            console.log("ErrorContext", ctx);
          }}
          fallback={<Callout $tone="danger">Check console for ErrorContext.</Callout>}
        >
          <Bomb armed={armed} />
        </ErrorBoundary>
      </Stack>
    </ExampleShell>
  );
};
