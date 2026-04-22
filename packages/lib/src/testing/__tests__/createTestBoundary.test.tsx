import { render, screen } from "@testing-library/react";
import { createTestBoundary } from "../createTestBoundary";

function Thrower(): never {
  throw new Error("boom");
}


test("captures last error and context", () => {
  const t = createTestBoundary();
  render(
    <t.Boundary>
      <Thrower />
    </t.Boundary>,
  );

  expect(screen.getByTestId("rr-caught")).toBeInTheDocument();
  expect(t.getLastError()?.message).toBe("boom");
  expect(t.getLastContext()?.fingerprint).toBeTypeOf("string");
});
