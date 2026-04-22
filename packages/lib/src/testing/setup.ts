import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

import { installMatchers } from "./matchers";

let errorSpy: ReturnType<typeof vi.spyOn> | null = null;

beforeEach(() => {
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  installMatchers();
});

afterEach(() => {
  errorSpy?.mockRestore();
  errorSpy = null;
});
