import type {
  ArrayPattern,
  AssignmentPattern,
  ExportNamedDeclaration,
  ObjectPattern,
  RestElement,
} from "estree";
import type { TransformationContext } from "./context";
import { createExportNamedClientReference } from "./utils";

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
 * const __Impl__a = ...;
 * const { b: __Impl__b } = ...;
 * const [__Impl__c] = ...;
 * export const a = registerClientReference(__Impl__a, ...);
 * export const b = registerClientReference(__Impl__b, ...);
 * export const c = registerClientReference(__Impl__c, ...);
 * export const d = registerClientReference(__Impl__d, ...);
 * ```
 */
export default function transformExportNamedDeclaration(
  node: ExportNamedDeclaration,
  context: TransformationContext,
) {
  const declaration = node.declaration!;

  const exports: ExportNamedDeclaration[] = [];

  switch (declaration.type) {
    case "FunctionDeclaration":
    case "ClassDeclaration":
      const implementationName =
        context.implementationPrefix + declaration.id.name;

      const exportName = declaration.id.name;

      context.scope.renameBinding(exportName, implementationName);

      exports.push(
        createExportNamedClientReference(
          exportName,
          implementationName,
          context,
        ),
      );

      break;
    case "VariableDeclaration":
      const exportedNames: string[] = [];

      for (const declarator of declaration.declarations) {
        switch (declarator.id.type) {
          case "Identifier":
            exportedNames.push(declarator.id.name);
            break;
          case "ObjectPattern":
            exportedNames.push(...getObjectPatternExportedNames(declarator.id));
            break;
          case "ArrayPattern":
            exportedNames.push(...getArrayPatternExportedNames(declarator.id));
            break;
        }
      }

      for (const exportName of exportedNames) {
        const implementationName = context.implementationPrefix + exportName;

        context.scope.renameBinding(exportName, implementationName);

        exports.push(
          createExportNamedClientReference(
            exportName,
            implementationName,
            context,
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

  context.program.body.push(...exports);
}

function getObjectPatternExportedNames(objectPattern: ObjectPattern) {
  const exportedNames: string[] = [];

  for (const property of objectPattern.properties) {
    switch (property.type) {
      case "RestElement":
        exportedNames.push(...getRestElementExportedNames(property));
        break;
      case "Property": {
        const value = property.value;
        switch (value.type) {
          case "Identifier":
            exportedNames.push(value.name);
            break;
          case "ObjectPattern":
            exportedNames.push(...getObjectPatternExportedNames(value));
            break;
          case "ArrayPattern":
            exportedNames.push(...getArrayPatternExportedNames(value));
            break;
          case "AssignmentPattern":
            exportedNames.push(...getAssignmentPatternExportedNames(value));
            break;
        }
        break;
      }
    }
  }

  return exportedNames;
}

function getArrayPatternExportedNames(arrayPattern: ArrayPattern) {
  const exportedNames: string[] = [];

  for (const element of arrayPattern.elements) {
    if (!element) continue;

    switch (element.type) {
      case "RestElement":
        exportedNames.push(...getRestElementExportedNames(element));
        break;
      case "Identifier":
        exportedNames.push(element.name);
        break;
      case "ObjectPattern":
        exportedNames.push(...getObjectPatternExportedNames(element));
        break;
      case "ArrayPattern":
        exportedNames.push(...getArrayPatternExportedNames(element));
        break;
      case "AssignmentPattern":
        exportedNames.push(...getAssignmentPatternExportedNames(element));
        break;
      // "MemberExpression" are only valid in assignments, not declarations
    }
  }

  return exportedNames;
}

function getAssignmentPatternExportedNames(
  assignmentPattern: AssignmentPattern,
) {
  const exportedNames: string[] = [];

  switch (assignmentPattern.left.type) {
    case "Identifier":
      exportedNames.push(assignmentPattern.left.name);
      break;
    case "ObjectPattern":
      exportedNames.push(
        ...getObjectPatternExportedNames(assignmentPattern.left),
      );
      break;
    case "ArrayPattern":
      exportedNames.push(
        ...getArrayPatternExportedNames(assignmentPattern.left),
      );
      break;
    // "MemberExpression" are only valid in assignments, not declarations
  }

  return exportedNames;
}

function getRestElementExportedNames(restElement: RestElement) {
  const exportedNames: string[] = [];

  switch (restElement.argument.type) {
    case "Identifier":
      exportedNames.push(restElement.argument.name);
      break;
    case "ObjectPattern":
      exportedNames.push(
        ...getObjectPatternExportedNames(restElement.argument),
      );
      break;
    case "ArrayPattern":
      exportedNames.push(...getArrayPatternExportedNames(restElement.argument));
      break;
    // "MemberExpression" are only valid in assignments, not declarations
  }

  return exportedNames;
}
