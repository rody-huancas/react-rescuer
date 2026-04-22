import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../../core/ErrorBoundary";
import { useErrorContext } from "../useErrorContext";

function Thrower(): never {
  throw new Error("boom");
}


function ContextReader() {
  const ctx = useErrorContext();
  return <div>fingerprint:{ctx.fingerprint}</div>;
}

test("provides ErrorContext to fallbacks", () => {
  render(
    <ErrorBoundary
      fallbackRender={() => {
        return <ContextReader />;
      }}
    >
      <Thrower />
    </ErrorBoundary>,
  );

  expect(screen.getByText(/fingerprint:/)).toBeInTheDocument();
});

test("throws when used outside a boundary fallback", () => {
  expect(() => render(<ContextReader />)).toThrow(
    "useErrorContext must be used within an ErrorBoundary fallback",
  );
});
