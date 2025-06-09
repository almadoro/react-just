import type {
  ClassDeclaration,
  ExportDefaultDeclaration,
  FunctionDeclaration,
} from "estree";
import { builders } from "estree-toolkit";
import { TransformationContext } from "./context";
import { createClientReferenceDeclaration } from "./utils";

/**
 * Transforms exports in the form of:
 * ```ts
 * let a;
 * export default a;
 *
 * export default function b() {}
 *
 * export default [];
 * ```
 *
 * Into:
 * ```ts
 * let a;
 * const $$Ref$$default = registerClientReference(a, ..., "default");
 * export default $$Ref$$default;
 *
 * function b() {}
 * const $$Ref$$default = registerClientReference(b, ..., "default");
 * export default $$Ref$$default;
 *
 * const $$default$$ = [];
 * const $$Ref$$default = registerClientReference($$default$$, ..., "default");
 * export default $$Ref$$default;
 * ```
 */
export default function transformExportDefaultDeclaration(
  node: ExportDefaultDeclaration,
  context: TransformationContext,
) {
  let implementationIdentifier: string;

  if (node.declaration.type === "Identifier") {
    // let a;
    // export default a;
    implementationIdentifier = node.declaration.name;

    context.program.body.splice(context.program.body.indexOf(node), 1);
  } else if (
    node.declaration.type === "FunctionDeclaration" ||
    node.declaration.type === "ClassDeclaration"
  ) {
    // export default function b() {}
    if (!node.declaration.id)
      node.declaration.id = builders.identifier("$$default$$");

    implementationIdentifier = node.declaration.id.name;

    context.program.body.splice(
      context.program.body.indexOf(node),
      1,
      node.declaration as FunctionDeclaration | ClassDeclaration, // identifier is now defined
    );
  } else {
    // export default [];
    implementationIdentifier = "$$default$$";

    const variableDeclaration = builders.variableDeclaration("const", [
      builders.variableDeclarator(
        builders.identifier(implementationIdentifier),
        node.declaration,
      ),
    ]);

    context.program.body.splice(
      context.program.body.indexOf(node),
      1,
      variableDeclaration,
    );
  }

  const referenceIdentifier = context.referencePrefix + "default";

  context.program.body.push(
    createClientReferenceDeclaration(
      {
        reference: referenceIdentifier,
        implementation: implementationIdentifier,
      },
      "default",
      context,
    ),
    builders.exportDefaultDeclaration(builders.identifier(referenceIdentifier)),
  );
}
