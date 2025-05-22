import { ModuleInfo, PluginContext } from "rollup";
import { describe, expect, test } from "vitest";
import { moduleParsed, transform } from "./plugin";

describe("plugin meta", () => {
  test("adds meta information to the module when transformed", async () => {
    const { code, meta } = await getMeta(
      "'use client'; export default function A() {}",
    );

    expect(code).toBeDefined();
    expect(meta).toMatchObject({ reactUseClient: { transformed: true } });
  });

  test("adds meta information to the module when not transformed", async () => {
    const { code, meta } = await getMeta("export default function A() {}");

    expect(code).not.toBeDefined();
    expect(meta).toMatchObject({ reactUseClient: { transformed: false } });
  });
});

async function getMeta(code: string) {
  const output = await transform(code, "module.js");

  const meta: Record<string, any> = output?.meta ?? {};

  moduleParsed.bind({} as PluginContext)({ meta } as ModuleInfo);

  return { code: output?.code, meta };
}
