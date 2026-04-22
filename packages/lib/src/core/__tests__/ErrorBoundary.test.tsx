import * as React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../ErrorBoundary";
import type { ErrorContext, FallbackProps } from "../types";

function Thrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("boom");
  return <div>ok</div>;
}

test("renders children when no error", () => {
  render(
    <ErrorBoundary fallback={<div>fallback</div>}>
      <div>child</div>
    </ErrorBoundary>,
  );
  expect(screen.getByText("child")).toBeInTheDocument();
});

test("supports fallback element", () => {
  render(
    <ErrorBoundary fallback={<div>fallback</div>}>
      <Thrower shouldThrow />
    </ErrorBoundary>,
  );
  expect(screen.getByText("fallback")).toBeInTheDocument();
});

test("supports fallbackRender", () => {
  render(
    <ErrorBoundary
      fallbackRender={({ error }: FallbackProps) => (
        <div>render: {error.message}</div>
      )}
    >
      <Thrower shouldThrow />
    </ErrorBoundary>,
  );
  expect(screen.getByText("render: boom")).toBeInTheDocument();
});

test("supports FallbackComponent", () => {
  function Fallback({ error }: FallbackProps) {
    return <div>component: {error.message}</div>;
  }

  render(
    <ErrorBoundary FallbackComponent={Fallback}>
      <Thrower shouldThrow />
    </ErrorBoundary>,
  );
  expect(screen.getByText("component: boom")).toBeInTheDocument();
});

test("calls onError with ErrorContext", () => {
  const onError =
    vi.fn<
      (error: Error, info: React.ErrorInfo, context: ErrorContext) => void
    >();

  render(
    <ErrorBoundary fallback={<div>fallback</div>} onError={onError}>
      <Thrower shouldThrow />
    </ErrorBoundary>,
  );

  expect(onError).toHaveBeenCalledTimes(1);
  const ctx = onError.mock.calls[0]?.[2];
  expect(ctx?.error).toBeInstanceOf(Error);
  expect(typeof ctx?.fingerprint).toBe("string");
});

test("resets when resetKeys change", () => {
  const { rerender } = render(
    <ErrorBoundary fallback={<div>fallback</div>} resetKeys={[0]}>
      <Thrower shouldThrow />
    </ErrorBoundary>,
  );

  expect(screen.getByText("fallback")).toBeInTheDocument();

  rerender(
    <ErrorBoundary fallback={<div>fallback</div>} resetKeys={[1]}>
      <Thrower shouldThrow={false} />
    </ErrorBoundary>,
  );

  expect(screen.getByText("ok")).toBeInTheDocument();
});
