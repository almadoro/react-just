import { ModuleInfo, PluginContext } from "rollup";
import { describe, expect, test } from "vitest";
import { moduleParsed, transform } from "./plugin";

describe("plugin meta", () => {
  test("adds meta information to the module when transformed", () => {
    const { code, meta } = getMeta(
      "'use client'; export default function A() {}",
    );

    expect(code).toBeDefined();
    expect(meta).toMatchObject({ reactUseClient: { transformed: true } });
  });

  test("adds meta information to the module when not transformed", () => {
    const { code, meta } = getMeta("export default function A() {}");

    expect(code).not.toBeDefined();
    expect(meta).toMatchObject({ reactUseClient: { transformed: false } });
  });
});

function getMeta(code: string) {
  const output = transform(code, "moduleId");

  const meta: Record<string, any> = output?.meta ?? {};

  moduleParsed.bind({} as PluginContext)({ meta } as ModuleInfo);

  return { code: output?.code, meta };
}
