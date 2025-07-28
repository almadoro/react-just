import { Program } from "estree";
import { traverse } from "estree-toolkit";
import transformExportDefaultDeclaration from "./export-default-declaration";
import transformExportNamedDeclaration from "./export-named-declaration";
import transformExportNamedFromSource from "./export-named-from-source";
import transformExportNamedSpecifiers from "./export-named-specifiers";
import Generator from "./generator";
import Module from "./module";

export default function transform(program: Program, options: TransformOptions) {
  const { generator, treeshakeImplementation } = options;

  const module = new Module(program);

  const useClientDirective = getUseClientDirective(program);

  if (!useClientDirective) return { transformed: false };

  module.remove(useClientDirective);

  module.unshift(generator.createRegisterFunctionImport());

  traverse(program, {
    ExportAllDeclaration() {
      throw new Error(
        "export all (`export *`) declarations are not supported on client modules",
      );
    },
    ExportNamedDeclaration(path) {
      const node = path.node!;
      if (node.source) {
        transformExportNamedFromSource(node, module, generator);
      } else if (node.declaration) {
        transformExportNamedDeclaration(node, module, generator);
      } else {
        transformExportNamedSpecifiers(node, module, generator);
      }
    },
    ExportDefaultDeclaration(path) {
      const node = path.node!;
      transformExportDefaultDeclaration(node, module, generator);
    },
  });

  if (treeshakeImplementation)
    program.body = generator.createTreeshakedBody(program.body);

  return { transformed: true };
}

export type TransformOptions = {
  generator: Generator;
  treeshakeImplementation: boolean;
};

const USE_CLIENT_DIRECTIVE = "use client";

function getUseClientDirective(program: Program) {
  // The "use client" directive must be the first node in the file.
  const firstNode = program.body[0];

  if (
    firstNode &&
    firstNode.type === "ExpressionStatement" &&
    firstNode.expression.type === "Literal" &&
    firstNode.expression.value === USE_CLIENT_DIRECTIVE
  )
    return firstNode;

  return null;
}
