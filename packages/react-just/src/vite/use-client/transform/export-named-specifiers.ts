import { ExportNamedDeclaration } from "estree";
import { Program } from "./program";

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
 * const $$Ref$$a = $$registerClientReference$$(...);
 * const $$Ref$$c = $$registerClientReference$$(...);
 * const $$Ref$$default = $$registerClientReference$$(...);
 * export { $$Ref$$a as a, $$Ref$$c as c, $$Ref$$default as default };
 * ```
 */
export default function transformExportNamedSpecifiers(
  node: ExportNamedDeclaration,
  program: Program,
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

    program.registerClientReference(exportIdentifier, localIdentifier);
  }

  program.removeExport(node);
}
