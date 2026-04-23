import { ErrorBoundary } from "react-rescuer";
import { useErrorBoundary } from "react-rescuer/hooks";
import { ExampleShell } from "../ui/ExampleShell";
import { Button, Callout, Stack } from "../ui/primitives";

const HookBomb = () => {
  const { showBoundary } = useErrorBoundary();
  return (
    <Button
      type="button"
      $variant="primary"
      onClick={() => {
        showBoundary(new Error("HookExample thrown via hook"));
      }}
    >
      Throw via hook
    </Button>
  );
};

export const HookExample = () => {
  return (
    <ExampleShell
      title="useErrorBoundary()"
      lead="For events (clicks, async work, handlers) where you want to raise an error into the nearest boundary."
      imports={`import { ErrorBoundary } from "react-rescuer";\nimport { useErrorBoundary } from "react-rescuer/hooks";`}
      api={[
        { name: "useErrorBoundary", detail: "returns showBoundary(error) to surface an error to the nearest boundary." },
        { name: "fallback", detail: "static fallback node for the boundary." }
      ]}
      tryIt={["Click Throw via hook.", "Notice it is not a render-time throw; it is raised imperatively."]}
    >
      <ErrorBoundary
        fallback={
          <Callout $tone="danger">
            <Stack $gap={6}>
              <div>
                <strong>Fallback:</strong> caught hook error.
              </div>
              <div>Use this for errors from events or async handlers.</div>
            </Stack>
          </Callout>
        }
      >
        <HookBomb />
      </ErrorBoundary>
    </ExampleShell>
  );
};
