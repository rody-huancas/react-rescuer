import type React from "react";

import { buildErrorContext } from "../context";
import { getBreadcrumbTrail } from "../breadcrumbs";

test("buildErrorContext includes fingerprint and breadcrumbs", () => {
  const trail = getBreadcrumbTrail();
  trail.clear();
  trail.add({ type: "custom", message: "m1" });

  const error = new Error("boom");
  const errorInfo: React.ErrorInfo = { componentStack: "at X" };

  const ctx = buildErrorContext(error, errorInfo, {
    sessionId : "s1",
    errorCount: 1,
    retryCount: 0,
  });

  expect(ctx.error).toBe(error);
  expect(typeof ctx.fingerprint).toBe("string");
  expect(ctx.breadcrumbs[0]?.message).toBe("m1");
});
