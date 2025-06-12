import type {
  ExportNamedDeclaration,
  ExportSpecifier,
  ImportSpecifier,
} from "estree";
import { builders } from "estree-toolkit";
import { TransformationContext } from "./context";
import { createClientReferenceDeclaration } from "./utils";

/**
 * Transforms exports in the form of:
 * ```ts
 * export { a, b as c, b as d, default, default as e } from "pkg";
 * ```
 *
 * Into:
 * ```ts
 * import { a as $$a$$, b as $$c$$, b as $$d$$, default as $$default$$, default as $$e$$ } from "pkg";
 * const $$Ref$$a = registerClientReference($$a$$, ..., "a");
 * const $$Ref$$c = registerClientReference($$c$$, ..., "c");
 * const $$Ref$$d = registerClientReference($$d$$, ..., "d");
 * const $$Ref$$default = registerClientReference($$default$$, ..., "default");
 * const $$Ref$$e = registerClientReference($$e$$, ..., "e");
 * export { $$Ref$$a as a, $$Ref$$c as c, $$Ref$$d as d, $$Ref$$default as default $$Ref$$e as e };
 * ```
 */
export default function transformExportNamedFromSource(
  node: ExportNamedDeclaration,
  context: TransformationContext,
) {
  const source = node.source!;

  const importSpecifiers: ImportSpecifier[] = [];
  const exportSpecifiers: ExportSpecifier[] = [];

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
    const referenceIdentifier = context.referencePrefix + exportIdentifier;

    importSpecifiers.push(
      builders.importSpecifier(
        builders.identifier(importIdentifier),
        builders.identifier(localIdentifier),
      ),
    );

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

  const importDeclaration = builders.importDeclaration(
    importSpecifiers,
    source,
  );

  context.program.body.unshift(importDeclaration);

  context.program.body.splice(context.program.body.indexOf(node), 1);

  context.program.body.push(
    builders.exportNamedDeclaration(null, exportSpecifiers),
  );
}
