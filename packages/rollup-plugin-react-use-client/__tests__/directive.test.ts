import { describe, expect, test } from "vitest";
import { transform } from "./plugin";

describe("use client directive", () => {
  test("returns undefined when no directive is found", async () => {
    const output = await transform("export default a;", "moduleId");

    expect(output).toBeUndefined();
  });

  test("removes the directive when found", async () => {
    const output = await transform(
      "'use client'; export default a;",
      "moduleId",
    );

    expect(output).toBeDefined();
    expect(output!.code).not.toContain("use client");
  });

  test("directive is ignored if not at the top of the file", async () => {
    const output = await transform(
      "export default a; 'use client';",
      "moduleId",
    );

    expect(output).toBeUndefined();
  });
});
