import { fingerprintError } from "../fingerprint";

test("fingerprint is deterministic for same error", () => {
  const e1 = new Error("boom");
  
  e1.name  = "TypeError";
  e1.stack = "TypeError: boom\nline1\nline2\nline3\nline4";

  const e2 = new Error("boom");

  e2.name  = "TypeError";
  e2.stack = "TypeError: boom\nline1\nline2\nline3\nline4";

  expect(fingerprintError(e1)).toBe(fingerprintError(e2));
});

test("fingerprint changes when stack changes", () => {
  const e1 = new Error("boom");

  e1.name  = "TypeError";
  e1.stack = "TypeError: boom\na\nb\nc";

  const e2 = new Error("boom");

  e2.name  = "TypeError";
  e2.stack = "TypeError: boom\nx\ny\nz";

  expect(fingerprintError(e1)).not.toBe(fingerprintError(e2));
});
