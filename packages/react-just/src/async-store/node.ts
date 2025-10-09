import { Context } from "@/types/flight.node";
import { AsyncLocalStorage } from "node:async_hooks";

const asyncLocalStorage = new AsyncLocalStorage<Context>();

export function request() {
  const store = asyncLocalStorage.getStore();

  if (!store)
    throw new Error("request must be called within a request context");

  return store.req;
}

export function response() {
  const store = asyncLocalStorage.getStore();

  if (!store)
    throw new Error("response must be called within a request context");

  return store.res;
}

export async function runWithContext<T extends () => unknown>(
  context: Context,
  fn: T,
): Promise<void> {
  await asyncLocalStorage.run(context, fn);
}
