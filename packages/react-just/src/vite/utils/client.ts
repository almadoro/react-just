import { createHash } from "node:crypto";
import path from "node:path";
import { ResolvedConfig } from "vite";

export function getInitializationCode(flightMimeType: string) {
  return (
    `import { hydrateFromWindowFlight, WINDOW_SHARED } from "react-just/client";` +
    `hydrateFromWindowFlight().then(root => {` +
    ` window[WINDOW_SHARED] = { root, rscMimeType: "${flightMimeType}" };` +
    `});`
  );
}

export function getModulesRegisteringCodeDevelopment(modulesIds: string[]) {
  let code = `import { registerModule } from "react-just/client";`;

  for (let i = 0; i < modulesIds.length; i++) {
    const id = modulesIds[i];
    code += `import * as  __entry__${i} from "${id}";`;
    code += `registerModule("${id}", __entry__${i});`;
  }

  return code;
}

export function getModulesRegisteringCodeProduction(
  modulesIds: string[],
  root: string,
) {
  let code = `import { registerModule } from "react-just/client";`;

  for (let i = 0; i < modulesIds.length; i++) {
    const id = modulesIds[i];
    code += `import * as  __entry__${i} from "${id}";`;
    code += `registerModule("${getModuleIdHash(id, root)}", __entry__${i});`;
  }

  return code;
}

export function getModuleRegisterId(id: string, config: ResolvedConfig) {
  if (config.mode === "development") return id;
  return getModuleIdHash(id, config.root);
}

function getModuleIdHash(id: string, root: string) {
  // Use a hash of the relative path to the project root as the module id.
  // This ensures that the module id is consistent across builds.
  const relativePath = path.relative(root, id);
  const hash = createHash("sha256").update(relativePath).digest("base64url");
  return hash;
}
