import type {
  ArrayPattern,
  AssignmentPattern,
  ExportNamedDeclaration,
  ExportSpecifier,
  ObjectPattern,
  RestElement,
} from "estree";
import { builders } from "estree-toolkit";
import { TransformationContext } from "./context";
import { createClientReferenceDeclaration } from "./utils";

/**
 * Transforms exports in the form of:
 * ```ts
 * export const a = ...;
 * export const { b } = ...;
 * export const [c] = ...;
 * export function d() { ... }
 * ```
 *
 * Into:
 * ```ts
 * const a = ...;
 * const { b } = ...;
 * const [c] = ...;
 * function d() { ... }
 * const $$Ref$$a = registerClientReference(a, ..., "a");
 * export { $$Ref$$a as a };
 * const $$Ref$$b = registerClientReference(b, ..., "b");
 * export { $$Ref$$b as b };
 * const $$Ref$$c = registerClientReference(c, ..., "c");
 * export { $$Ref$$c as c };
 * const $$Ref$$d = registerClientReference(d, ..., "d");
 * export { $$Ref$$d as d };
 * ```
 */
export default function transformExportNamedDeclaration(
  node: ExportNamedDeclaration,
  context: TransformationContext,
) {
  const declaration = node.declaration!;

  const exportSpecifiers: ExportSpecifier[] = [];

  switch (declaration.type) {
    case "FunctionDeclaration":
    case "ClassDeclaration":
      const exportIdentifier = declaration.id.name;
      const implementationIdentifier = exportIdentifier;
      const referenceIdentifier = context.referencePrefix + exportIdentifier;

      context.program.body.push(
        createClientReferenceDeclaration(
          {
            reference: referenceIdentifier,
            implementation: implementationIdentifier,
          },
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

      break;
    case "VariableDeclaration":
      const exportedIdentifiers: string[] = [];

      for (const declarator of declaration.declarations) {
        switch (declarator.id.type) {
          case "Identifier":
            exportedIdentifiers.push(declarator.id.name);
            break;
          case "ObjectPattern":
            exportedIdentifiers.push(
              ...getObjectPatternExportedIdentifiers(declarator.id),
            );
            break;
          case "ArrayPattern":
            exportedIdentifiers.push(
              ...getArrayPatternExportedIdentifiers(declarator.id),
            );
            break;
        }
      }

      for (const exportIdentifier of exportedIdentifiers) {
        const implementationIdentifier = exportIdentifier;
        const referenceIdentifier = context.referencePrefix + exportIdentifier;

        context.program.body.push(
          createClientReferenceDeclaration(
            {
              reference: referenceIdentifier,
              implementation: implementationIdentifier,
            },
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

      break;
  }

  // Remove the export and leave the declaration in place
  context.program.body.splice(
    context.program.body.indexOf(node),
    1,
    declaration,
  );

  context.program.body.push(
    builders.exportNamedDeclaration(null, exportSpecifiers),
  );
}

function getObjectPatternExportedIdentifiers(objectPattern: ObjectPattern) {
  const exportedIdentifiers: string[] = [];

  for (const property of objectPattern.properties) {
    switch (property.type) {
      case "RestElement":
        exportedIdentifiers.push(
          ...getRestElementExportedIdentifiers(property),
        );
        break;
      case "Property": {
        const value = property.value;
        switch (value.type) {
          case "Identifier":
            exportedIdentifiers.push(value.name);
            break;
          case "ObjectPattern":
            exportedIdentifiers.push(
              ...getObjectPatternExportedIdentifiers(value),
            );
            break;
          case "ArrayPattern":
            exportedIdentifiers.push(
              ...getArrayPatternExportedIdentifiers(value),
            );
            break;
          case "AssignmentPattern":
            exportedIdentifiers.push(
              ...getAssignmentPatternExportedIdentifiers(value),
            );
            break;
        }
        break;
      }
    }
  }

  return exportedIdentifiers;
}

function getArrayPatternExportedIdentifiers(arrayPattern: ArrayPattern) {
  const exportedIdentifiers: string[] = [];

  for (const element of arrayPattern.elements) {
    if (!element) continue;

    switch (element.type) {
      case "RestElement":
        exportedIdentifiers.push(...getRestElementExportedIdentifiers(element));
        break;
      case "Identifier":
        exportedIdentifiers.push(element.name);
        break;
      case "ObjectPattern":
        exportedIdentifiers.push(
          ...getObjectPatternExportedIdentifiers(element),
        );
        break;
      case "ArrayPattern":
        exportedIdentifiers.push(
          ...getArrayPatternExportedIdentifiers(element),
        );
        break;
      case "AssignmentPattern":
        exportedIdentifiers.push(
          ...getAssignmentPatternExportedIdentifiers(element),
        );
        break;
      // "MemberExpression" are only valid in assignments, not declarations
    }
  }

  return exportedIdentifiers;
}

function getAssignmentPatternExportedIdentifiers(
  assignmentPattern: AssignmentPattern,
) {
  const exportedIdentifiers: string[] = [];

  switch (assignmentPattern.left.type) {
    case "Identifier":
      exportedIdentifiers.push(assignmentPattern.left.name);
      break;
    case "ObjectPattern":
      exportedIdentifiers.push(
        ...getObjectPatternExportedIdentifiers(assignmentPattern.left),
      );
      break;
    case "ArrayPattern":
      exportedIdentifiers.push(
        ...getArrayPatternExportedIdentifiers(assignmentPattern.left),
      );
      break;
    // "MemberExpression" are only valid in assignments, not declarations
  }

  return exportedIdentifiers;
}

function getRestElementExportedIdentifiers(restElement: RestElement) {
  const exportedIdentifiers: string[] = [];

  switch (restElement.argument.type) {
    case "Identifier":
      exportedIdentifiers.push(restElement.argument.name);
      break;
    case "ObjectPattern":
      exportedIdentifiers.push(
        ...getObjectPatternExportedIdentifiers(restElement.argument),
      );
      break;
    case "ArrayPattern":
      exportedIdentifiers.push(
        ...getArrayPatternExportedIdentifiers(restElement.argument),
      );
      break;
    // "MemberExpression" are only valid in assignments, not declarations
  }

  return exportedIdentifiers;
}
