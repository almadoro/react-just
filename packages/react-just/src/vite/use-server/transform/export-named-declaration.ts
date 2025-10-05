import {
  ArrayPattern,
  AssignmentPattern,
  ExportNamedDeclaration,
  ObjectPattern,
  RestElement,
} from "estree";
import Generator from "./generator";
import Module from "./module";

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
 * const $$Ref$$a = $$registerServerReference$$(...);
 * export { $$Ref$$a as a };
 * const $$Ref$$b = $$registerServerReference$$(...);
 * export { $$Ref$$b as b };
 * const $$Ref$$c = $$registerServerReference$$(...);
 * export { $$Ref$$c as c };
 * const $$Ref$$d = $$registerServerReference$$(...);
 * export { $$Ref$$d as d };
 * ```
 */
export default function transformExportNamedDeclaration(
  node: ExportNamedDeclaration,
  module: Module,
  generator: Generator,
) {
  const declaration = node.declaration!;

  switch (declaration.type) {
    case "FunctionDeclaration":
    case "ClassDeclaration":
      const exportIdentifier = declaration.id.name;
      const implementationIdentifier = exportIdentifier;

      module.append(
        ...generator.createRegisterAndExportReference(
          exportIdentifier,
          implementationIdentifier,
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

        module.append(
          ...generator.createRegisterAndExportReference(
            exportIdentifier,
            implementationIdentifier,
          ),
        );
      }

      break;
  }

  module.replace(node, declaration);
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
