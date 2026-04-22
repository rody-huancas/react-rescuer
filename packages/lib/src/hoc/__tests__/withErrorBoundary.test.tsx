import { render, screen } from "@testing-library/react";
import { withErrorBoundary } from "../withErrorBoundary";

function MaybeThrow({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("boom");
  return <div>ok</div>;
}

test("wraps component with an ErrorBoundary", () => {
  const Wrapped = withErrorBoundary(MaybeThrow, {
    fallback: <div>fallback</div>,
  });
  render(<Wrapped shouldThrow />);
  expect(screen.getByText("fallback")).toBeInTheDocument();
});
