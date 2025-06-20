import useClientTransform, {
  TransformOptions,
} from "@/vite/use-client/transform";
import { generate } from "astring";
import { builders } from "estree-toolkit";
import fs from "node:fs/promises";
import path from "node:path";
import { parseAst } from "vite";
import { describe, expect, test } from "vitest";

// client-like transform options
const noTreeshakeOpts: TransformOptions = {
  getRegisterArguments: ({ exportName, implementationIdentifier }) => [
    builders.identifier(implementationIdentifier),
    builders.literal(exportName),
  ],
  registerClientReferenceSource: "pkg",
  treeshakeImplementation: false,
};

// flight-like transform options
const treeshakeOpts: TransformOptions = {
  getRegisterArguments: ({ exportName }) => [builders.literal(exportName)],
  registerClientReferenceSource: "pkg",
  treeshakeImplementation: true,
};

describe("transforms with no treeshake", transformTests(noTreeshakeOpts));

describe("transforms with treeshake", transformTests(treeshakeOpts));

function transformTests(options: TransformOptions) {
  return () => {
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

      test(
        "identifier",
        transformTest("export-named-declaration/identifier.js"),
      );

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

    test(
      "export named specifiers",
      transformTest("export-named-specifiers.js"),
    );

    test("export all declarations not supported", () => {
      expect(() =>
        transform("'use client'; export * from 'pkg';"),
      ).toThrowError();
    });
  };

  function transformTest(filepath: string) {
    return async () => {
      const code = await fs.readFile(
        path.resolve(import.meta.dirname, "fixtures", filepath),
        "utf-8",
      );

      const output = transform(code);

      expect(output).toMatchSnapshot();
    };
  }

  function transform(code: string) {
    const ast = parseAst(code);

    useClientTransform(ast, options);

    return generate(ast);
  }
}
