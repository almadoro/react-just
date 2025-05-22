import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { transform } from "./plugin";

describe("transforms", () => {
  describe("export default declarations", () => {
    test(
      "class declarations",
      transformTest("export-default-declaration/class-declaration.js"),
    );

    test(
      "function declarations",
      transformTest("export-default-declaration/function-declaration.js"),
    );

    test(
      "identifier",
      transformTest("export-default-declaration/identifier.js"),
    );

    test(
      "value declarations",
      transformTest("export-default-declaration/value-declaration.js"),
    );
  });

  describe("export named declarations", () => {
    test(
      "array pattern",
      transformTest("export-named-declaration/array-pattern.js"),
    );

    test(
      "assignment pattern",
      transformTest("export-named-declaration/assignment-pattern.js"),
    );

    test("class", transformTest("export-named-declaration/class.js"));

    test("identifier", transformTest("export-named-declaration/identifier.js"));

    test("function", transformTest("export-named-declaration/function.js"));

    test(
      "object pattern",
      transformTest("export-named-declaration/object-pattern.js"),
    );

    test(
      "rest element",
      transformTest("export-named-declaration/rest-element.js"),
    );
  });

  test(
    "export named from source",
    transformTest("export-named-from-source.js"),
  );

  test("export named specifiers", transformTest("export-named-specifiers.js"));

  test("export all declarations not supported", () => {
    expect(
      transform("'use client'; export * from 'pkg';", "module.js"),
    ).rejects.toThrowError();
  });
});

function transformTest(filePath: string) {
  return async () => {
    const input = await fs.readFile(
      path.resolve(import.meta.dirname, "fixtures/transforms", filePath),
      "utf-8",
    );

    const output = await transform(input, "module.js");

    expect(output?.code).toMatchSnapshot();
  };
}
