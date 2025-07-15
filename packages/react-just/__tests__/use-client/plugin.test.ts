import useClient, { getEsbuildPlugin } from "@/vite/use-client";
import { build } from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import { TransformPluginContext } from "rollup";
import { Environment, parseAst } from "vite";
import { describe, expect, test, vi } from "vitest";

describe("extensions", () => {
  const SUPPORTED_EXTENSIONS = [".js", ".jsx", ".mjs", ".ts", ".tsx", ".mts"];
  const UNSUPPORTED_EXTENSIONS = [".cjs", ".cts", ".css"];

  for (const extension of SUPPORTED_EXTENSIONS) {
    test(`applies transform to ${extension}`, async () => {
      const { output } = await transform("client" + extension);
      expect(output).toBeDefined();
    });

    test(`applies esbuild plugin to ${extension}`, async () => {
      const { output } = await buildWithEsbuild("client" + extension);
      expect(output).toMatchSnapshot();
    });
  }

  for (const extension of UNSUPPORTED_EXTENSIONS) {
    test(`doesn't apply transform to ${extension}`, async () => {
      const { output } = await transform("not-valid" + extension);
      expect(output).toBeUndefined();
    });

    test(`doesn't apply esbuild plugin to ${extension}`, async () => {
      const { output } = await buildWithEsbuild("not-valid" + extension);
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
  test("adds to environments modules when transform is applied", async () => {
    onModuleTransformed.mockClear();

    const { entry } = await transform("client.js");

    expect(onModuleTransformed).toHaveBeenCalledWith(entry);
  });

  test("doesn't add to environments modules when transform is applied", async () => {
    onModuleTransformed.mockClear();

    const { entry } = await transform("not-client.js");

    expect(onModuleTransformed).not.toHaveBeenCalledWith(entry);
  });

  test("adds to environments modules when esbuild plugin is applied", async () => {
    onModuleTransformed.mockClear();

    const { entry } = await buildWithEsbuild("client.js");

    expect(onModuleTransformed).toHaveBeenCalledWith(entry);
  });

  test("doesn't add to environments modules when esbuild plugin is applied", async () => {
    onModuleTransformed.mockClear();

    await buildWithEsbuild("not-client.js");

    expect(onModuleTransformed).not.toHaveBeenCalled();
  });
});

const ENV_NAME = "test";
const onModuleTransformed = vi.fn();
const environment = {
  onModuleTransformed,
  transformOptions: {
    getRegisterArguments: () => [],
    registerClientReferenceSource: "pkg",
    treeshakeImplementation: false,
  },
};

const plugin = useClient({
  environments: {
    [ENV_NAME]: environment,
  },
});

async function transform(filepath: string) {
  const entry = path.resolve(import.meta.dirname, "fixtures/esbuild", filepath);

  const code = await fs.readFile(entry, "utf-8");

  const output = await plugin.transform.apply(
    {
      parse: parseAst,
      environment: { name: ENV_NAME },
    } as TransformPluginContext,
    [code, entry],
  );

  return { output, entry };
}

const esbuildPlugin = getEsbuildPlugin(environment);

async function buildWithEsbuild(filepath: string) {
  const entry = path.resolve(import.meta.dirname, "fixtures/esbuild", filepath);

  const result = await build({
    entryPoints: [entry],
    write: false,
    bundle: true,
    plugins: [esbuildPlugin],
    packages: "external",
    format: "esm",
  });

  return { output: result.outputFiles![0].text, entry };
}
