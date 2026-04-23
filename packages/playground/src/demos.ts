import type { ComponentType } from "react";
import { BasicExample } from "./examples/BasicExample";
import { HookExample } from "./examples/HookExample";
import { ObservabilityExample } from "./examples/ObservabilityExample";
import { RetryExample } from "./examples/RetryExample";

export type DemoKey = "basic" | "retry" | "hook" | "observability";

export type Demo = {
  key        : DemoKey;
  title      : string;
  description: string;
  pills      : string[];
  Component  : ComponentType;
};

export const demos: Demo[] = [
  {
    key        : "basic",
    title      : "Basic Boundary",
    description: "fallbackRender + resetKeys (react-error-boundary style).",
    pills      : ["core", "resetKeys"],
    Component  : BasicExample,
  },
  {
    key        : "retry",
    title      : "Recovery / Retries",
    description: "recovery.maxRetries + retryDelay + retryCount.",
    pills      : ["core", "recovery"],
    Component  : RetryExample,
  },
  {
    key        : "hook",
    title      : "useErrorBoundary",
    description: "imperatively raise errors to the nearest boundary.",
    pills      : ["hooks"],
    Component  : HookExample,
  },
  {
    key        : "observability",
    title      : "Observability",
    description: "buildErrorContext + breadcrumbs + onError.",
    pills      : ["observability"],
    Component  : ObservabilityExample,
  },
];
