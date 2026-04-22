import { render } from "@testing-library/react";
import { installMatchers } from "../matchers";
import { createTestBoundary } from "../createTestBoundary";

installMatchers();

function Thrower(): never {
  throw new Error("kaboom");
}


test("custom matchers work", () => {
  const t = createTestBoundary();
  render(
    <t.Boundary>
      <Thrower />
    </t.Boundary>,
  );

  // @ts-expect-error - custom matcher
  expect(t).toHaveCaughtError();
  // @ts-expect-error - custom matcher
  expect(t).toHaveCaughtErrorMatching(/kaboom/);
});
