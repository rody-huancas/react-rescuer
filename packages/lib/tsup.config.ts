/// <reference types="node" />

import { defineConfig } from "tsup";

export default defineConfig({
  tsconfig: "tsconfig.build.json",
  entry   : {
    index             : "src/core/index.ts",
    hooks             : "src/hooks/index.ts",
    hoc               : "src/hoc/index.ts",
    observability     : "src/observability/index.ts",
    recovery          : "src/recovery/index.ts",
    "reporters/sentry": "src/reporters/sentry.ts",
    testing           : "src/testing/index.ts",
  },
  format   : ["esm", "cjs"],
  dts      : true,
  splitting: false,
  sourcemap: true,
  clean    : true,
  external : ["react", "react-dom"],
  esbuildOptions(options) {
    options.define = {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV ?? "production",
      ),
    };
  },
});
