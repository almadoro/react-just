import fs from "node:fs/promises";
import path from "node:path";
import type {
  BuildEnvironment,
  ViteBuilder,
  Manifest as ViteManifest,
} from "vite";
import type { Manifest as ReactJustManifest } from "../../server/types";

const OUTPUT_PUBLIC_DIR = "public";
const OUTPUT_SERVER_DIR = "server";
const FLIGHT_MIME_TYPE = "text/x-component";
const MANIFEST_FILE_NAME = "manifest.json";

export default async function buildApp(builder: ViteBuilder) {
  const serverEnv = builder.environments.server;
  const clientEnv = builder.environments.client;

  const { root, publicDir: inputPublicDir } = builder.config;
  const { outDir, emptyOutDir, copyPublicDir } = builder.config.build;

  const outputPath = path.resolve(root, outDir);
  const outputPublicPath = path.resolve(outputPath, OUTPUT_PUBLIC_DIR);
  const outputServerPath = path.resolve(outputPath, OUTPUT_SERVER_DIR);
  await fs.mkdir(outputPublicPath, { recursive: true });
  await fs.mkdir(outputServerPath, { recursive: true });

  if (emptyOutDir) await fs.rm(path.resolve(root, outDir), { recursive: true });

  if (copyPublicDir) {
    const from = path.resolve(root, inputPublicDir);
    try {
      await fs.access(from, fs.constants.F_OK);
      await fs.cp(from, outputPublicPath, { recursive: true, force: true });
    } catch {}
  }

  // It is required that the server build is executed first to
  // catch all the client entries.
  await builder.build(serverEnv);
  await builder.build(clientEnv);

  const serverBuild = await getEnvBuildData(serverEnv);
  const clientBuild = await getEnvBuildData(clientEnv);

  const { server, css } = await transformServerBuild(serverBuild, {
    public: outputPublicPath,
    server: outputServerPath,
    root: outputPath,
  });

  const js = await transformClientBuild(clientBuild, {
    public: outputPublicPath,
  });

  await writeManifest(
    {
      version: "1",
      app: { server, css, js },
      publicDir: OUTPUT_PUBLIC_DIR,
      flight: { mimeType: FLIGHT_MIME_TYPE },
    },
    outputPath,
  );

  await fs.rm(clientBuild.path, { recursive: true });
  await fs.rm(serverBuild.path, { recursive: true });
}

async function readViteManifest(path: string) {
  const manifest = await fs.readFile(path, "utf-8");
  return JSON.parse(manifest) as ViteManifest;
}

type BuildData = { path: string; manifest: ViteManifest };

async function getEnvBuildData(env: BuildEnvironment): Promise<BuildData> {
  const root = env.config.root;
  const outDir = env.config.build.outDir;
  const outPath = path.resolve(root, outDir);
  const manifestFilename = env.config.build.manifest as string;
  const manifest = (await readViteManifest(
    path.resolve(outPath, manifestFilename),
  )) as ViteManifest;
  return { path: outPath, manifest };
}

async function transformServerBuild(
  build: BuildData,
  paths: { public: string; server: string; root: string },
) {
  let server: string | undefined;
  const css: string[] = [];

  for (const entry of Object.values(build.manifest)) {
    if (entry.isEntry) {
      const newPath = path.resolve(paths.server, entry.file);
      await fs.cp(path.resolve(build.path, entry.file), newPath);
      server = path.relative(paths.root, newPath);
    }

    if (entry.css) {
      for (const relativePath of entry.css) {
        await fs.cp(
          path.resolve(build.path, relativePath),
          path.resolve(paths.public, relativePath),
        );
        css.push(relativePath);
      }
    }

    if (entry.assets) {
      for (const relativePath of entry.assets) {
        await fs.cp(
          path.resolve(build.path, relativePath),
          path.resolve(paths.public, relativePath),
        );
      }
    }
  }

  if (!server) throw new Error("Server entry not found in manifest");

  return { server, css };
}

async function transformClientBuild(
  build: BuildData,
  paths: { public: string },
) {
  const js: string[] = [];

  for (const entry of Object.values(build.manifest)) {
    if (entry.isEntry) {
      await fs.cp(
        path.resolve(build.path, entry.file),
        path.resolve(paths.public, entry.file),
      );
      js.push(entry.file);
    }

    // CSS and other assets are moved in the server build
  }

  return js;
}

async function writeManifest(manifest: ReactJustManifest, outputPath: string) {
  await fs.writeFile(
    path.resolve(outputPath, MANIFEST_FILE_NAME),
    JSON.stringify(manifest, null, 2),
  );
}
