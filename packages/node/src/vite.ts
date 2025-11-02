import fs from "node:fs/promises";
import path from "node:path";
import { ENTRIES, ENVIRONMENTS } from "react-just/vite";
import { Manifest, Plugin, ViteBuilder, normalizePath } from "vite";
import {
  DEFAULT_BUILD_PATH,
  SERVER_DIR,
  SERVER_ENTRY_FILENAME,
  STATIC_DIR,
} from "./constants";

export default function node(): Plugin {
  let manifests: { client: Manifest; fizz: Manifest; flight: Manifest };
  let outDirs: {
    client: string;
    fizz: string;
    flight: string;
  };

  async function buildApp(builder: ViteBuilder) {
    if (!outDirs) throw new Error("Expected outDirs to be defined");

    // Flight environment must be the first one to be built.
    await builder.build(builder.environments[ENVIRONMENTS.FLIGHT_NODE]);
    await builder.build(builder.environments[ENVIRONMENTS.FIZZ_NODE]);
    await builder.build(builder.environments[ENVIRONMENTS.CLIENT]);

    const { root } = builder.config;

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

    await builder.build(builder.environments[SERVER_ENVIRONMENT]);
  }

  return {
    name: "react-just:node",
    apply: "build",
    sharedDuringBuild: true,
    config(config) {
      const outDir = config.build?.outDir ?? DEFAULT_BUILD_PATH;
      const clientOutDir = path.join(outDir, STATIC_DIR);
      const serverOutDir = path.join(outDir, SERVER_DIR);
      const fizzOutDir = path.join(serverOutDir, "fizz");
      const flightOutDir = path.join(serverOutDir, "flight");

      outDirs = {
        client: clientOutDir,
        fizz: fizzOutDir,
        flight: flightOutDir,
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
          [SERVER_ENVIRONMENT]: {
            build: {
              outDir: serverOutDir,
              copyPublicDir: false,
              rollupOptions: {
                input: SERVER_ENTRY,
                output: { entryFileNames: SERVER_ENTRY_FILENAME },
              },
            },
            resolve: { noExternal: true },
          },
        },
      };
    },
    resolveId(id) {
      if (id === SERVER_ENTRY) return RESOLVED_SERVER_ENTRY;
    },
    load(id) {
      if (id !== RESOLVED_SERVER_ENTRY) return;

      if (!manifests) throw new Error("Expected manifests to be defined");
      if (!outDirs) throw new Error("Expected outDirs to be defined");

      return getServerEntryCode(
        this.environment.config.root,
        outDirs,
        manifests,
      );
    },
  };
}

const ENTRY_CHUNK_NAME = "index";

const MANIFEST_PATH = "manifest.json";

const SERVER_ENVIRONMENT = "server";

async function readAndDeleteManifest(path: string) {
  const manifestStr = await fs.readFile(path, "utf-8");
  const manifest = JSON.parse(manifestStr) as Manifest;
  await fs.rm(path);
  return manifest;
}

const SERVER_ENTRY = "/virtual:@react-just/node/server-entry";
const RESOLVED_SERVER_ENTRY = "\0" + SERVER_ENTRY;

function getServerEntryCode(
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
    `import { App, createTemporaryReferenceSet, decodeAction, decodeFormState, decodeReply, React, renderToPipeableStream as renderToPipeableRscStream, runWithContext } from "${normalizePath(flightEntry)}";\n` +
    `import { renderToPipeableStream as renderToPipeableHtmlStream } from "${normalizePath(fizzEntry)}";\n` +
    `import { createHandle } from "@react-just/node/handle"\n` +
    `export default createHandle({\n` +
    `  App,\n` +
    `  createTemporaryReferenceSet,\n` +
    `  decodeAction,\n` +
    `  decodeFormState,\n` +
    `  decodeReply,\n` +
    `  React,\n` +
    `  renderToPipeableHtmlStream,\n` +
    `  renderToPipeableRscStream,\n` +
    `  resources: ${JSON.stringify({ css, js }, null, 2)},\n` +
    `  runWithContext,\n` +
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
