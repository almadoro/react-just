import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { DevEnvironment, Environment } from "vite";
import { invalidateModules, optimizeDeps } from "../utils";

export default class ClientModules {
  private nonOptimizedModuleIds = new Set<string>();
  private optimizedModuleIds = new Set<string>();
  private initHash: string | null = null;
  private environmentsHashes = new Map<Environment, string>();

  public [Symbol.iterator]() {
    return [...this.nonOptimizedModuleIds, ...this.optimizedModuleIds][
      Symbol.iterator
    ]();
  }

  public add(id: string) {
    if (id.includes("node_modules/")) this.optimizedModuleIds.add(id);
    else this.nonOptimizedModuleIds.add(id);
  }

  public delete(id: string) {
    this.optimizedModuleIds.delete(id);
    this.nonOptimizedModuleIds.delete(id);
  }

  public async getEntryCode(environment: Environment) {
    let code = `import "${OPTIMIZED_CLIENT_MODULES}";`;

    const currentHash =
      this.environmentsHashes.get(environment) ?? this.initHash;
    const newHash = await writeOptimizedClientModules(this.optimizedModuleIds);
    this.environmentsHashes.set(environment, newHash);

    if (environment instanceof DevEnvironment) {
      // Some scan environments don't have a deps optimizer.
      if (environment.depsOptimizer && currentHash !== newHash)
        await optimizeDeps(environment);
      // Some modules could have been used as non-client module. Invalidate them
      // to force them to be re-imported and transformed.
      invalidateModules(environment, ...this.nonOptimizedModuleIds);
    }

    for (const id of this.nonOptimizedModuleIds) {
      code += `import "${id}";`;
    }

    return code;
  }

  public has(id: string) {
    return (
      this.nonOptimizedModuleIds.has(id) || this.optimizedModuleIds.has(id)
    );
  }

  public async initOptimized() {
    this.initHash = await initOptimizedClientModules();
  }
}

// Packages modules can't be directly imported on development because Vite
// won't resolve dependencies to their optimized versions (e.g., react and
// react-dom); thus, untransformed commonjs files may be referenced. They
// can only be used as an optimized dependency. Also, using an optimized
// package avoids network congestion on the browser on development.

// Use ":" to avoid possible conflicts with actual packages.
export const OPTIMIZED_CLIENT_MODULES = "react-just:optimized-client-modules";

export const OPTIMIZED_CLIENT_MODULES_DIR = path.resolve(
  "node_modules/.react-just/optimized-client-modules",
);
const OPTIMIZED_CLIENT_MODULES_PACKAGE_JSON = path.resolve(
  OPTIMIZED_CLIENT_MODULES_DIR,
  "package.json",
);
const MAIN_FILE_NAME = "index.js";
const OPTIMIZED_CLIENT_MODULES_MAIN = path.resolve(
  OPTIMIZED_CLIENT_MODULES_DIR,
  MAIN_FILE_NAME,
);

async function initOptimizedClientModules() {
  let hash: string | null;

  try {
    const packageJson = await fs.readFile(
      OPTIMIZED_CLIENT_MODULES_PACKAGE_JSON,
      "utf-8",
    );
    hash = JSON.parse(packageJson).hash;
  } catch {
    hash = null;
  }

  let mainExists: boolean;

  try {
    await fs.access(OPTIMIZED_CLIENT_MODULES_MAIN, fs.constants.F_OK);
    mainExists = true;
  } catch {
    mainExists = false;
  }

  const initialized = hash && mainExists;

  if (initialized) return hash;

  return await writeOptimizedClientModules([]);
}

async function writeOptimizedClientModules(moduleIds: Iterable<string>) {
  await fs.mkdir(OPTIMIZED_CLIENT_MODULES_DIR, { recursive: true });

  let code = "export {};";

  // Sort ids to generate consistent hash
  for (const id of [...moduleIds].sort()) {
    code += `import "${id}";`;
  }

  const hash = crypto.createHash("sha256").update(code).digest("hex");

  await fs.writeFile(OPTIMIZED_CLIENT_MODULES_MAIN, code);

  const packageJson = {
    type: "module",
    main: MAIN_FILE_NAME,
    // Write a hash that changes with the content of the package to generate
    // different hash on next optimization metadata.
    hash,
  };

  await fs.writeFile(
    OPTIMIZED_CLIENT_MODULES_PACKAGE_JSON,
    JSON.stringify(packageJson, null, 2),
  );

  return hash;
}
