import { describe, expect, test } from "vitest";
import transform from "./transform";

describe("use client directive", () => {
  test("returns undefined when no directive is found", () => {
    const output = transform("export default a;", "moduleId");

    expect(output).toBeUndefined();
  });

  test("removes the directive when found", () => {
    const output = transform("'use client'; export default a;", "moduleId");

    expect(output).toBeDefined();
    expect(output).not.toContain("use client");
  });

  test("directive is ignored if not at the top of the file", () => {
    const output = transform("export default a; 'use client';", "moduleId");

    expect(output).toBeUndefined();
  });
});
