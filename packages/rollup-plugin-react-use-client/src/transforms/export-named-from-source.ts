import type { ExportNamedDeclaration, ImportSpecifier } from "estree";
import { builders } from "estree-toolkit";
import type { TransformationContext } from "./context";
import { createExportNamedClientReference } from "./utils";

/**
 * Transforms exports in the form of:
 * ```ts
 * export { a, b as c } from "pkg";
 * ```
 *
 * Into:
 * ```ts
 * import { a as __Impl__a, b as __Impl__c } from "pkg";
 * export const a = registerClientReference(__Impl__a, ...);
 * export const c = registerClientReference(__Impl__c, ...);
 * ```
 */
export default function transformExportNamedFromSource(
  node: ExportNamedDeclaration,
  context: TransformationContext,
) {
  const source = node.source!;

  const imports: ImportSpecifier[] = [];
  const exports: ExportNamedDeclaration[] = [];

  for (const specifier of node.specifiers) {
    if (
      specifier.local.type !== "Identifier" ||
      specifier.exported.type !== "Identifier"
    )
      /* c8 ignore next */
      continue;

    const localName = specifier.local.name;
    const exportName = specifier.exported.name;
    const implementationName = context.implementationPrefix + exportName;

    imports.push(
      builders.importSpecifier(
        builders.identifier(localName),
        builders.identifier(implementationName),
      ),
    );

    exports.push(
      createExportNamedClientReference(exportName, implementationName, context),
    );
  }

  const importDeclaration = builders.importDeclaration(imports, source);

  context.program.body.unshift(importDeclaration);

  context.program.body.splice(
    context.program.body.indexOf(node),
    1,
    ...exports,
  );
}
