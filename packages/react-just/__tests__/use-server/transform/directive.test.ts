import baseTransform from "@/vite/use-server/transform";
import Generator from "@/vite/use-server/transform/generator";
import { generate } from "astring";
import { builders } from "estree-toolkit";
import fs from "node:fs/promises";
import path from "node:path";
import { parseAst } from "vite";
import { describe, expect, test } from "vitest";

describe("'use server' module level directive", () => {
  test("doesn't transform when there is no directive", async () => {
    const { transformed, code } = await transform("directive/no-directive.js");

    expect(transformed).toBe(false);
    expect(code).toMatchSnapshot();
  });

  test("transforms when the directive is found at the top of the file", async () => {
    const { transformed, code } = await transform(
      "directive/valid-module-level.js",
    );

    expect(transformed).toBe(true);
    expect(code).toMatchSnapshot();
  });

  test("doesn't transform when the directive is not at the top of the file", async () => {
    const { transformed, code } = await transform(
      "directive/invalid-module-level.js",
    );

    expect(transformed).toBe(false);
    expect(code).toMatchSnapshot();
  });
});

async function transform(filepath: string) {
  const code = await fs.readFile(
    path.resolve(import.meta.dirname, "fixtures", filepath),
    "utf-8",
  );

  const ast = parseAst(code);

  const { transformed } = baseTransform(ast, {
    generator: new Generator({
      getRegisterArguments: ({ exportName }) => [builders.literal(exportName)],
      registerServerReferenceSource: "react-just",
    }),
    treeshakeImplementation: false,
  });

  return { transformed, code: generate(ast) };
}
