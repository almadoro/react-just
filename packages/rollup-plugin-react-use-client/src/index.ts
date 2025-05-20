import { generate } from "astring";
import { builders, traverse } from "estree-toolkit";
import type { Plugin, ProgramNode } from "rollup";
import { TransformationContext } from "./transforms/context";
import transformExportDefaultDeclaration from "./transforms/export-default-declaration";
import transformExportNamedDeclaration from "./transforms/export-named-declaration";
import transformExportNamedFromSource from "./transforms/export-named-from-source";
import transformExportNamedSpecifiers from "./transforms/export-named-specifiers";
import { ReactUseClientOptions } from "./types";

export default function reactUseClient(options: ReactUseClientOptions) {
  const implementationPrefix = IMPLEMENTATION_PREFIX;

  const { registerClientReference } = options;

  const registerClientReferenceIdentifier =
    registerClientReference.as || registerClientReference.import;

  return {
    name: "react-use-client",
    async transform(code, id) {
      const ast = this.parse(code);

      const useClientDirective = getUseClientDirective(ast);

      if (!useClientDirective) return;

      ast.body.splice(ast.body.indexOf(useClientDirective), 1);

      const moduleId = await options.moduleId(id);

      traverse(ast, {
        $: { scope: true },
        ExportAllDeclaration() {
          throw new Error(
            "export all (`export *`) declarations are not supported on client components",
          );
        },
        ExportNamedDeclaration(path) {
          const node = path.node!;
          const scope = path.scope!;

          const context: TransformationContext = {
            program: ast,
            scope,
            implementationPrefix,
            registerClientReferenceIdentifier,
            moduleId,
          };

          if (node.source) {
            transformExportNamedFromSource(node, context);
          } else if (node.declaration) {
            transformExportNamedDeclaration(node, context);
          } else {
            transformExportNamedSpecifiers(node, context);
          }
        },
        ExportDefaultDeclaration(path) {
          const node = path.node!;
          const scope = path.scope!;

          const context: TransformationContext = {
            program: ast,
            scope,
            implementationPrefix,
            registerClientReferenceIdentifier,
            moduleId,
          };

          transformExportDefaultDeclaration(node, context);
        },
      });

      addRegisterClientReferenceImport(ast, registerClientReference);

      return {
        code: generate(ast),
        meta: { reactUseClient: { transformed: true } },
      };
    },
    moduleParsed(moduleInfo) {
      if (!moduleInfo.meta.reactUseClient)
        moduleInfo.meta.reactUseClient = { transformed: false };
    },
  } satisfies Plugin;
}

const IMPLEMENTATION_PREFIX = "__Impl__";

const USE_CLIENT_DIRECTIVE = "use client";

function getUseClientDirective(ast: ProgramNode) {
  // In client components, the directive "use client" must be the first
  // node in the file.
  const firstNode = ast.body[0];

  if (
    firstNode &&
    firstNode.type === "ExpressionStatement" &&
    firstNode.expression.type === "Literal" &&
    firstNode.expression.value === USE_CLIENT_DIRECTIVE
  )
    return firstNode;

  return null;
}

function addRegisterClientReferenceImport(
  ast: ProgramNode,
  importOptions: ReactUseClientOptions["registerClientReference"],
) {
  ast.body.unshift(
    builders.importDeclaration(
      [
        builders.importSpecifier(
          builders.identifier(importOptions.import),
          builders.identifier(importOptions.as || importOptions.import),
        ),
      ],
      builders.literal(importOptions.from),
    ),
  );
}
