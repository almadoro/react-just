import { ExportNamedDeclaration, ImportSpecifier } from "estree";
import { builders } from "estree-toolkit";
import Generator from "./generator";
import Module from "./module";

/**
 * Transforms exports in the form of:
 * ```ts
 * export { a, b as c, b as d, default, default as e } from "pkg";
 * ```
 *
 * Into:
 * ```ts
 * import {
 *   a as $$a$$,
 *   b as $$c$$,
 *   b as $$d$$,
 *   default as $$default$$,
 *   default as $$e$$
 * } from "pkg";
 * const $$Ref$$a = $$registerClientReference$$(...);
 * const $$Ref$$c = $$registerClientReference$$(...);
 * const $$Ref$$d = $$registerClientReference$$(...);
 * const $$Ref$$default = $$registerClientReference$$(...);
 * const $$Ref$$e = $$registerClientReference$$(...);
 * export {
 *   $$Ref$$a as a,
 *   $$Ref$$c as c,
 *   $$Ref$$d as d,
 *   $$Ref$$default as default,
 *   $$Ref$$e as e
 * };
 * ```
 */
export default function transformExportNamedFromSource(
  node: ExportNamedDeclaration,
  module: Module,
  generator: Generator,
) {
  const source = node.source!;

  const importSpecifiers: ImportSpecifier[] = [];

  for (const specifier of node.specifiers) {
    if (
      specifier.local.type !== "Identifier" ||
      specifier.exported.type !== "Identifier"
    )
      /* c8 ignore next */
      continue;

    const importIdentifier = specifier.local.name;
    const exportIdentifier = specifier.exported.name;
    // It's allowed to export an identifier from a module with the same
    // name as another identifier within the same module. Add the $$
    // prefix and suffix to avoid collisions.
    const localIdentifier = "$$" + exportIdentifier + "$$";

    importSpecifiers.push(
      builders.importSpecifier(
        builders.identifier(importIdentifier),
        builders.identifier(localIdentifier),
      ),
    );

    module.append(
      ...generator.createRegisterAndExportReference(
        exportIdentifier,
        localIdentifier,
      ),
    );
  }

  module.unshift(builders.importDeclaration(importSpecifiers, source));

  module.remove(node);
}
