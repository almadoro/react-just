import transform, { TransformOptions } from "@/vite/use-client/transform";
import Generator from "@/vite/use-client/transform/generator";
import { generate } from "astring";
import { builders } from "estree-toolkit";
import fs from "node:fs/promises";
import path from "node:path";
import { parseAstAsync } from "vite";
import { describe, expect, test } from "vitest";

const MODULE_ID = "module.js";

// client-like environment
const noTreeshakeEnv: TransformOptions = {
  generator: new Generator({
    getRegisterArguments: ({ exportName, implementationIdentifier }) => [
      builders.identifier(implementationIdentifier),
      builders.literal(MODULE_ID),
      builders.literal(exportName),
    ],
    registerClientReferenceSource: "react-just/no-treeshake",
  }),
  treeshakeImplementation: false,
};

// flight-like environment
const treeshakeEnv: TransformOptions = {
  generator: new Generator({
    getRegisterArguments: ({ exportName }) => [
      builders.literal(MODULE_ID),
      builders.literal(exportName),
    ],
    registerClientReferenceSource: "react-just/treeshake",
  }),
  treeshakeImplementation: true,
};

describe(
  "transforms exports on a no-treeshake environment",
  exportsTests(noTreeshakeEnv),
);
describe(
  "transforms exports on a treeshake environment",
  exportsTests(treeshakeEnv),
);

function exportsTests(options: TransformOptions) {
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

    test("throws when there is an export all declaration", async () => {
      const code = "'use client'; export * from 'pkg'";

      const program = await parseAstAsync(code);

      expect(() => transform(program, options)).toThrowError();
    });
  };

  function transformTest(filepath: string) {
    return async () => {
      const code = await fs.readFile(
        path.resolve(import.meta.dirname, "fixtures", filepath),
        "utf-8",
      );

      const program = await parseAstAsync(code);

      transform(program, options);

      const output = generate(program);

      expect(output).toMatchSnapshot();
    };
  }
}
