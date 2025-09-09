import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { DevEnvironment, EnvironmentModuleNode } from "vite";
import { optimizeDeps } from "../utils";

export default class ClientModules {
  private nonOptimizedModuleIds = new Set<string>();
  private optimizedModuleIds = new Set<string>();

  constructor(
    private clientLikeDevEnvironments: DevEnvironment[],
    private resolvedEntryId: string,
  ) {}

  public addNonOptimized(id: string) {
    this.nonOptimizedModuleIds.add(id);
    // The module could have been used as non-client module. Invalidate it.
    this.invalidate([this.resolvedEntryId, id]);
  }

  public async addOptimized(ids: string[]) {
    for (const id of ids) this.optimizedModuleIds.add(id);
    await writeOptimizedClientModules(this.optimizedModuleIds);
    await Promise.all(this.clientLikeDevEnvironments.map(optimizeDeps));
  }

  public getCode(isDev: boolean) {
    let code = "";

    if (isDev) code += `import "${OPTIMIZED_CLIENT_MODULES}";`;

    for (const id of this.nonOptimizedModuleIds) {
      code += `import "${id}";`;
    }

    return code;
  }

  public hasNonOptimized(id: string) {
    return this.nonOptimizedModuleIds.has(id);
  }

  public async initOptimized() {
    await initOptimizedClientModules();
  }

  public removeNonOptimized(id: string) {
    this.nonOptimizedModuleIds.delete(id);
    // The module could have been used as client module. Invalidate it.
    this.invalidate([this.resolvedEntryId, id]);
  }

  private invalidate(ids: string[]) {
    for (const env of this.clientLikeDevEnvironments) {
      const invalidatedModules = new Set<EnvironmentModuleNode>();
      for (const moduleId of ids) {
        const module = env.moduleGraph.getModuleById(moduleId);
        if (module)
          env.moduleGraph.invalidateModule(
            module,
            invalidatedModules,
            Date.now(),
            true,
          );
      }
    }
  }
}

// Packages modules can't be directly imported on development because Vite
// won't resolve dependencies to their optimized versions (e.g., react and
// react-dom); thus, untransformed commonjs files may be referenced. They
// can only be used as an optimized dependency. Also, using an optimized
// package avoids network congestion on the browser on development.

export const OPTIMIZED_CLIENT_MODULES =
  "node_modules/.react-just/optimized-client-modules";

const OPTIMIZED_CLIENT_MODULES_DIR = path.resolve(OPTIMIZED_CLIENT_MODULES);
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
  let packageJsonExists: boolean;

  try {
    await fs.access(OPTIMIZED_CLIENT_MODULES_PACKAGE_JSON, fs.constants.F_OK);
    packageJsonExists = true;
  } catch {
    packageJsonExists = false;
  }

  let mainExists: boolean;

  try {
    await fs.access(OPTIMIZED_CLIENT_MODULES_MAIN, fs.constants.F_OK);
    mainExists = true;
  } catch {
    mainExists = false;
  }

  const initialized = packageJsonExists && mainExists;

  if (!initialized) await writeOptimizedClientModules([]);
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
}
