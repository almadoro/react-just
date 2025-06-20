import useClientTransform from "@/vite/use-client/transform";
import { generate } from "astring";
import { parseAst } from "vite";
import { describe, expect, test } from "vitest";

describe("use client directive", () => {
  test("does nothing when no directive is found", () => {
    const { transformed } = transform("export default a;");

    expect(transformed).toBe(false);
  });

  test("removes the directive when found", () => {
    const { transformed, code } = transform("'use client'; export default a;");

    expect(transformed).toBe(true);
    expect(code).not.toContain("use client");
  });

  test("directive is ignored if not at the top of the file", () => {
    const { transformed, code } = transform("export default a; 'use client';");

    expect(transformed).toBe(false);
    expect(code).toContain("use client");
  });
});

function transform(code: string) {
  const ast = parseAst(code);

  const { transformed } = useClientTransform(ast, {
    getRegisterArguments: () => [],
    registerClientReferenceSource: "pkg",
  });

  return { transformed, code: generate(ast) };
}
