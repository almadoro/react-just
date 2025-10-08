import { AsyncLocalStorage } from "node:async_hooks";

interface Context {
  req: Request;
}

const asyncLocalStorage = new AsyncLocalStorage<Context>();

export function request() {
  const store = asyncLocalStorage.getStore();

  if (!store)
    throw new Error("request must be called within a request context");

  return store.req;
}

export async function runWithContext(
  context: Context,
  fn: () => void,
): Promise<void> {
  asyncLocalStorage.run(context, fn);
}
