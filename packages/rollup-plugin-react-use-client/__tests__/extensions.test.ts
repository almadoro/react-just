import { describe, expect, test } from "vitest";
import { transform } from "./plugin";

const SUPPORTED_EXTENSIONS = [
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
];

const UNSUPPORTED_EXTENSIONS = [".css", ".html"];

describe("plugin transforms extensions", () => {
  for (const extension of SUPPORTED_EXTENSIONS) {
    test(`transforms ${extension}`, async () => {
      const output = await transform('"use client";', "module" + extension);
      expect(output?.code).toBeDefined();
    });
  }

  for (const extension of UNSUPPORTED_EXTENSIONS) {
    test(`does not transforms ${extension}`, async () => {
      const output = await transform('"use client";', "module" + extension);
      expect(output?.code).toBeUndefined();
    });
  }
});
