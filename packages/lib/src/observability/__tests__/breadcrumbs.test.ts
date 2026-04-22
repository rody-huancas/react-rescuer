import { addBreadcrumb, getBreadcrumbTrail } from "../breadcrumbs";

test("keeps a sliding window of 20 breadcrumbs", () => {
  const trail = getBreadcrumbTrail();
  trail.clear();

  for (let i = 0; i < 25; i++) {
    addBreadcrumb({ type: "custom", message: `b${i}` });
  }

  const items = trail.get();

  expect(items).toHaveLength(20);
  expect(items[0]?.message).toBe("b5");
  expect(items[19]?.message).toBe("b24");
});

test("clears on react-rescuer:reset event", () => {
  const trail = getBreadcrumbTrail();
  
  trail.clear();
  addBreadcrumb({ type: "custom", message: "x" });
  expect(trail.get()).toHaveLength(1);

  window.dispatchEvent(
    new CustomEvent("react-rescuer:reset", { detail: { sessionId: "rr" } }),
  );
  expect(trail.get()).toHaveLength(0);
});
