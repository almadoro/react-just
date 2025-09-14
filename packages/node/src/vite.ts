import fs from "node:fs/promises";
import path from "node:path";
import { ENTRIES, ENVIRONMENTS, RSC_MIME_TYPE } from "react-just/vite";
import { Manifest, Plugin } from "vite";
import { DEFAULT_BUILD_PATH, ENTRY_PATH } from "./constants";

export default function node(): Plugin {
  return {
    name: "react-just:node",
    apply: "build",
    config(config) {
      const root = config.root ?? process.cwd();
      const outDir = config.build?.outDir ?? DEFAULT_BUILD_PATH;
      const clientOutDir = path.join(outDir, "client");
      const fizzOutDir = path.join(outDir, "fizz");
      const flightOutDir = path.join(outDir, "flight");

      return {
        builder: {
          sharedPlugins: true,
          async buildApp(builder) {
            // Flight environment must be the first one to be built.
            await builder.build(builder.environments[ENVIRONMENTS.FLIGHT_NODE]);
            await builder.build(builder.environments[ENVIRONMENTS.FIZZ_NODE]);
            await builder.build(builder.environments[ENVIRONMENTS.CLIENT]);

            const clientManifest = await readAndDeleteManifest(
              path.resolve(root, clientOutDir, MANIFEST_PATH),
            );
            const fizzManifest = await readAndDeleteManifest(
              path.resolve(root, fizzOutDir, MANIFEST_PATH),
            );
            const flightManifest = await readAndDeleteManifest(
              path.resolve(root, flightOutDir, MANIFEST_PATH),
            );

            const clientChunk = findEntryChunk(clientManifest);
            const fizzChunk = findEntryChunk(fizzManifest);
            const flightChunk = findEntryChunk(flightManifest);

            const css = (clientChunk.css ?? []).map((p) => path.join("/", p));
            const js = [path.join("/", clientChunk.file)];
            const publicDir = path.relative(outDir, clientOutDir);

            const fizzEntry = path.relative(
              outDir,
              path.join(fizzOutDir, fizzChunk.file),
            );
            const flightEntry = path.relative(
              outDir,
              path.join(flightOutDir, flightChunk.file),
            );

            const code =
              `import { App, React, renderToPipeableStream as renderToPipeableRscStream } from "./${toJsPath(flightEntry)}";\n` +
              `import { renderToPipeableStream as renderToPipeableHtmlStream } from "./${toJsPath(fizzEntry)}";\n` +
              `const resources = ${JSON.stringify({ publicDir, css, js }, null, 2)};\n` +
              `const rscMimeType = "${RSC_MIME_TYPE}";\n` +
              `export { App, React, renderToPipeableHtmlStream, renderToPipeableRscStream, resources, rscMimeType }`;

            await fs.writeFile(path.resolve(root, outDir, ENTRY_PATH), code);
          },
        },
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
        },
      };
    },
  };
}

const ENTRY_CHUNK_NAME = "index";

const MANIFEST_PATH = "manifest.json";

async function readAndDeleteManifest(path: string) {
  const manifestStr = await fs.readFile(path, "utf-8");
  const manifest = JSON.parse(manifestStr) as Manifest;
  await fs.rm(path);
  return manifest;
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
