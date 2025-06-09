import type { ExportNamedDeclaration, ExportSpecifier } from "estree";
import { builders } from "estree-toolkit";
import { TransformationContext } from "./context";
import { createClientReferenceDeclaration } from "./utils";

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
 * const $$Ref$$a = registerClientReference(a, ..., "a");
 * const $$Ref$$c = registerClientReference(b, ..., "c");
 * const $$Ref$$default = registerClientReference(d, ..., "default");
 * export { $$Ref$$a as a, $$Ref$$c as c, $$Ref$$default as default };
 * ```
 */
export default function transformExportNamedSpecifiers(
  node: ExportNamedDeclaration,
  context: TransformationContext,
) {
  const exportSpecifiers: ExportSpecifier[] = [];

  for (const specifier of node.specifiers) {
    if (
      specifier.local.type !== "Identifier" ||
      specifier.exported.type !== "Identifier"
    )
      /* c8 ignore next */
      continue;

    const localIdentifier = specifier.local.name;
    const exportIdentifier = specifier.exported.name;
    const referenceIdentifier = context.referencePrefix + exportIdentifier;

    context.program.body.push(
      createClientReferenceDeclaration(
        { reference: referenceIdentifier, implementation: localIdentifier },
        exportIdentifier,
        context,
      ),
    );

    exportSpecifiers.push(
      builders.exportSpecifier(
        builders.identifier(referenceIdentifier),
        builders.identifier(exportIdentifier),
      ),
    );
  }

  context.program.body.splice(context.program.body.indexOf(node), 1);

  context.program.body.push(
    builders.exportNamedDeclaration(null, exportSpecifiers),
  );
}
