import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../../core/ErrorBoundary";
import { useErrorBoundary } from "../useErrorBoundary";

function HookThrower() {
  const { showBoundary } = useErrorBoundary();
  return (
    <button
      onClick={() => {
        showBoundary(new Error("from hook"));
      }}
    >
      trigger
    </button>
  );
}

test("showBoundary throws into nearest boundary", () => {
  render(
    <ErrorBoundary fallback={<div>fallback</div>}>
      <HookThrower />
    </ErrorBoundary>,
  );

  fireEvent.click(screen.getByText("trigger"));
  expect(screen.getByText("fallback")).toBeInTheDocument();
});
