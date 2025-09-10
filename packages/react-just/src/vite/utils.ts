import { DevEnvironment, EnvironmentModuleNode } from "vite";

// Taken from: https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts#L92
const CSS_EXTENSIONS_RE =
  /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)($|\?)/;

export function isCssModule(id: string) {
  return CSS_EXTENSIONS_RE.test(id);
}

export async function optimizeDeps(env: DevEnvironment) {
  const { depsOptimizer } = env;

  if (!depsOptimizer)
    throw new Error(`Deps optimizer not found on ${env.name} environment`);

  const initialMetadata = depsOptimizer.metadata;

  depsOptimizer.run();

  // Vite doesn't provide a way to wait for the optimization to be done.
  // We need to poll the metadata instance until it changes.
  // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/optimizer/optimizer.ts#L419
  await new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (depsOptimizer.metadata === initialMetadata) return;
      clearInterval(interval);
      resolve();
    }, 0);
  });
}

export function invalidateModules(env: DevEnvironment, ...ids: string[]) {
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
