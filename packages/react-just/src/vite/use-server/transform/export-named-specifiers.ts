import { ExportNamedDeclaration } from "estree";
import Generator from "./generator";
import Module from "./module";

/**
 * Transforms exports in the form of:
 * ```ts
 * let a;
 * let b;
 * let d;
 * export { a, b as c, d as default };
 * ```
 *
 * Into:
 * ```ts
 * let a;
 * let b;
 * let d;
 * const $$Ref$$a = $$registerServerReference$$(...);
 * const $$Ref$$c = $$registerServerReference$$(...);
 * const $$Ref$$default = $$registerServerReference$$(...);
 * export { $$Ref$$a as a, $$Ref$$c as c, $$Ref$$default as default };
 * ```
 */
export default function transformExportNamedSpecifiers(
  node: ExportNamedDeclaration,
  module: Module,
  generator: Generator,
) {
  for (const specifier of node.specifiers) {
    if (
      specifier.local.type !== "Identifier" ||
      specifier.exported.type !== "Identifier"
    )
      /* c8 ignore next */
      continue;

    const localIdentifier = specifier.local.name;
    const exportIdentifier = specifier.exported.name;

    module.append(
      ...generator.createRegisterAndExportReference(
        exportIdentifier,
        localIdentifier,
      ),
    );
  }

  module.remove(node);
}
