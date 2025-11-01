import transform, { TransformOptions } from "@/vite/use-client/transform";
import Generator from "@/vite/use-client/transform/generator";
import { generate } from "astring";
import { builders } from "estree-toolkit";
import fs from "node:fs/promises";
import path from "node:path";
import { parseAstAsync } from "vite";
import { describe, expect, test } from "vitest";

describe("'use client' directive", () => {
  test("throws and error when there is no directive and doesn't modify the program", async () => {
    const program = await getProgram("directive/no-directive.js");

    expect(() => transform(program, OPTIONS)).toThrowError();

    const code = generate(program);

    expect(code).toMatchSnapshot();
  });

  test("transforms when the directive is found at the top of the file or after other directives", async () => {
    const program = await getProgram("directive/valid.js");

    transform(program, OPTIONS);

    const code = generate(program);

    expect(code).toMatchSnapshot();
  });

  test("throws and error when the directive is not at the top of the file and doesn't modify the program", async () => {
    const program = await getProgram("directive/invalid.js");

    expect(() => transform(program, OPTIONS)).toThrowError();

    const code = generate(program);

    expect(code).toMatchSnapshot();
  });
});

const OPTIONS: TransformOptions = {
  generator: new Generator({
    getRegisterArguments: ({ exportName }) => [builders.literal(exportName)],
    registerClientReferenceSource: "react-just",
  }),
  treeshakeImplementation: false,
};

async function getProgram(filepath: string) {
  const code = await fs.readFile(
    path.resolve(import.meta.dirname, "fixtures", filepath),
    "utf-8",
  );

  return parseAstAsync(code);
}
