import fs from "node:fs/promises";
import path from "node:path";
import { ENTRIES, ENVIRONMENTS } from "react-just/vite";
import { Manifest, Plugin, ViteBuilder } from "vite";

export default function vercel(): Plugin {
  let manifests: { client: Manifest; fizz: Manifest; flight: Manifest };
  let outDirs: {
    client: string;
    fizz: string;
    flight: string;
    function: string;
  };

  async function buildApp(builder: ViteBuilder) {
    if (!outDirs) throw new Error("Expected outDirs to be defined");

    // Flight environment must be the first one to be built.
    await builder.build(builder.environments[ENVIRONMENTS.FLIGHT_NODE]);
    await builder.build(builder.environments[ENVIRONMENTS.FIZZ_NODE]);
    await builder.build(builder.environments[ENVIRONMENTS.CLIENT]);

    const {
      root,
      build: { outDir },
    } = builder.config;

    manifests = {
      client: await readAndDeleteManifest(
        path.resolve(root, outDirs.client, MANIFEST_PATH),
      ),
      fizz: await readAndDeleteManifest(
        path.resolve(root, outDirs.fizz, MANIFEST_PATH),
      ),
      flight: await readAndDeleteManifest(
        path.resolve(root, outDirs.flight, MANIFEST_PATH),
      ),
    };

    const outputPath = path.resolve(root, outDir);

    await writeOutputConfig(outputPath);

    await builder.build(builder.environments[FUNCTION_ENVIRONMENT]);

    await writeFunctionConfig(path.resolve(root, outDirs.function));
  }

  return {
    name: "react-just:vercel",
    apply: "build",
    sharedDuringBuild: true,
    config(config) {
      const outDir = config.build?.outDir ?? ".vercel/output";
      const clientOutDir = path.join(outDir, "static");
      const functionOutDir = path.join(
        outDir,
        "functions",
        RENDER_FN + ".func",
      );
      const fizzOutDir = path.join(functionOutDir, "fizz");
      const flightOutDir = path.join(functionOutDir, "flight");

      outDirs = {
        client: clientOutDir,
        fizz: fizzOutDir,
        flight: flightOutDir,
        function: functionOutDir,
      };

      return {
        builder: { buildApp },
        build: { outDir, emptyOutDir: config.build?.emptyOutDir ?? true },
        environments: {
          [ENVIRONMENTS.CLIENT]: {
            build: {
              outDir: clientOutDir,
              manifest: MANIFEST_PATH,
              rollupOptions: {
                input: { [ENTRY_CHUNK_NAME]: ENTRIES.CLIENT },
              },
            },
          },
          [ENVIRONMENTS.FIZZ_NODE]: {
            build: {
              outDir: fizzOutDir,
              manifest: MANIFEST_PATH,
              copyPublicDir: false,
              rollupOptions: {
                input: { [ENTRY_CHUNK_NAME]: ENTRIES.FIZZ_NODE },
              },
            },
          },
          [ENVIRONMENTS.FLIGHT_NODE]: {
            build: {
              outDir: flightOutDir,
              manifest: MANIFEST_PATH,
              copyPublicDir: false,
              rollupOptions: {
                input: { [ENTRY_CHUNK_NAME]: ENTRIES.FLIGHT_NODE },
              },
            },
          },
          [FUNCTION_ENVIRONMENT]: {
            build: {
              outDir: functionOutDir,
              copyPublicDir: false,
              rollupOptions: {
                input: FUNCTION_ENTRY,
                output: { entryFileNames: FUNCTION_ENTRY_FILENAME },
              },
            },
            resolve: { noExternal: true },
          },
        },
      };
    },
    resolveId(id) {
      if (id === FUNCTION_ENTRY) return RESOLVED_FUNCTION_ENTRY;
    },
    load(id) {
      if (id !== RESOLVED_FUNCTION_ENTRY) return;

      if (!manifests) throw new Error("Expected manifests to be defined");
      if (!outDirs) throw new Error("Expected outDirs to be defined");

      return getFunctionEntryCode(
        this.environment.config.root,
        outDirs,
        manifests,
      );
    },
  };
}

const ENTRY_CHUNK_NAME = "index";

const MANIFEST_PATH = "manifest.json";

const FUNCTION_ENVIRONMENT = "function";

async function readAndDeleteManifest(path: string) {
  const manifestStr = await fs.readFile(path, "utf-8");
  const manifest = JSON.parse(manifestStr) as Manifest;
  await fs.rm(path);
  return manifest;
}

const FUNCTION_ENTRY = "/virtual:@react-just/vercel/function-entry";
const RESOLVED_FUNCTION_ENTRY = "\0" + FUNCTION_ENTRY;

function getFunctionEntryCode(
  root: string,
  outDirs: { fizz: string; flight: string },
  manifests: { client: Manifest; fizz: Manifest; flight: Manifest },
) {
  const clientChunk = findEntryChunk(manifests.client);
  const fizzChunk = findEntryChunk(manifests.fizz);
  const flightChunk = findEntryChunk(manifests.flight);

  const css = (clientChunk.css ?? []).map((p) => path.join("/", p));
  const js = [path.join("/", clientChunk.file)];

  const fizzEntry = path.resolve(root, outDirs.fizz, fizzChunk.file);
  const flightEntry = path.resolve(root, outDirs.flight, flightChunk.file);

  return (
    `import { App, decodePayloadIncomingMessage, React, renderToPipeableStream as renderToPipeableRscStream } from "${toJsPath(flightEntry)}";\n` +
    `import { renderToPipeableStream as renderToPipeableHtmlStream } from "${toJsPath(fizzEntry)}";\n` +
    `import { createHandle } from "@react-just/vercel/handle"\n` +
    `export default createHandle({\n` +
    `  App,\n` +
    `  decodePayloadIncomingMessage,\n` +
    `  React,\n` +
    `  renderToPipeableRscStream,\n` +
    `  renderToPipeableHtmlStream,\n` +
    `  resources: ${JSON.stringify({ css, js }, null, 2)}\n` +
    `});`
  );
}

function findEntryChunk(manifest: Manifest) {
  for (const chunk of Object.values(manifest)) {
    if (chunk.name === ENTRY_CHUNK_NAME) {
      return chunk;
    }
  }
  throw new Error("Entry chunk not found in manifest");
}

function toJsPath(path: string) {
  return path.replace(/\\/g, "/");
}

const RENDER_FN = "_render";

async function writeOutputConfig(outputPath: string) {
  await fs.writeFile(
    path.resolve(outputPath, "config.json"),
    JSON.stringify(
      {
        version: 3,
        routes: [
          { handle: "filesystem" },
          // filesystem must appear before the render function for the static
          // files to be served.
          { src: "/(.*)", dest: RENDER_FN },
        ],
      },
      null,
      2,
    ),
  );
}

const FUNCTION_ENTRY_FILENAME = "index.mjs";

async function writeFunctionConfig(functionOutDir: string) {
  await fs.writeFile(
    path.resolve(functionOutDir, ".vc-config.json"),
    JSON.stringify(
      {
        handler: FUNCTION_ENTRY_FILENAME,
        runtime: "nodejs22.x",
        supportsResponseStreaming: true,
      },
      null,
      2,
    ),
  );
}
