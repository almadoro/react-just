import useClient, { getEsbuildPlugin } from "@/vite/use-client";
import { build } from "esbuild";
import path from "node:path";
import { TransformPluginContext } from "rollup";
import { Environment, parseAst } from "vite";
import { describe, expect, test } from "vitest";

describe("extensions", () => {
  const SUPPORTED_EXTENSIONS = [".js", ".jsx", ".mjs", ".ts", ".tsx", ".mts"];
  const UNSUPPORTED_EXTENSIONS = [".cjs", ".cts", ".css"];

  for (const extension of SUPPORTED_EXTENSIONS) {
    test(`applies transform to ${extension}`, () => {
      const output = transform('"use client";', "module" + extension);
      expect(output).toBeDefined();
    });

    test(`applies esbuild plugin to ${extension}`, async () => {
      const output = await buildWithEsbuild("client" + extension);
      expect(output).toMatchSnapshot();
    });
  }

  for (const extension of UNSUPPORTED_EXTENSIONS) {
    test(`doesn't apply transform to ${extension}`, () => {
      const output = transform('"use client";', "module" + extension);
      expect(output).toBeUndefined();
    });

    test(`doesn't apply esbuild plugin to ${extension}`, async () => {
      const output = await buildWithEsbuild("not-valid" + extension);
      expect(output).toMatchSnapshot();
    });
  }
});

describe("environments", () => {
  test("applies to test environment", () => {
    expect(plugin.applyToEnvironment({ name: ENV_NAME } as Environment)).toBe(
      true,
    );

    expect(plugin.configEnvironment(ENV_NAME)).toMatchObject({
      optimizeDeps: {
        esbuildOptions: {
          plugins: [expect.any(Object)],
        },
      },
    });
  });

  test("doesn't apply to other environments", () => {
    const environment = { name: "ssr" } as Environment;

    expect(plugin.applyToEnvironment(environment)).toBe(false);

    expect(plugin.configEnvironment(environment.name)).toBeUndefined();
  });
});

describe("modules", () => {
  const ID = "module.js";

  test("adds to environments modules when transform is applied", () => {
    modules.clear();

    transform('"use client";', ID);

    expect(modules.size).toBe(1);
    expect(modules.has(ID)).toBe(true);
  });

  test("doesn't add to environments modules when transform is applied", () => {
    modules.clear();

    transform("export default a;", ID);

    expect(modules.size).toBe(0);
  });

  test("adds to environments modules when esbuild plugin is applied", async () => {
    modules.clear();

    await buildWithEsbuild("client.js");

    expect(modules.size).toBe(1);
  });

  test("doesn't add to environments modules when esbuild plugin is applied", async () => {
    modules.clear();

    await buildWithEsbuild("not-client.js");

    expect(modules.size).toBe(0);
  });
});

const ENV_NAME = "test";
const modules = new Set<string>();
const environment = {
  modules,
  transformOptions: {
    getRegisterArguments: () => [],
    registerClientReferenceSource: "pkg",
  },
};

const plugin = useClient({
  environments: {
    [ENV_NAME]: environment,
  },
});

function transform(code: string, id: string) {
  return plugin.transform.apply(
    {
      parse: parseAst,
      environment: { name: ENV_NAME },
    } as TransformPluginContext,
    [code, id],
  );
}

const esbuildPlugin = getEsbuildPlugin(environment);

async function buildWithEsbuild(filepath: string) {
  const result = await build({
    entryPoints: [
      path.resolve(import.meta.dirname, "fixtures/esbuild", filepath),
    ],
    write: false,
    bundle: true,
    plugins: [esbuildPlugin],
    packages: "external",
    format: "esm",
  });

  return result.outputFiles![0].text;
}
