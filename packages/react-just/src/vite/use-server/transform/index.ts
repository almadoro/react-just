import {
  ArrowFunctionExpression,
  FunctionDeclaration,
  FunctionExpression,
  Program,
} from "estree";
import { NodePath, traverse } from "estree-toolkit";
import {
  getIsUseServerDirective,
  getUseServerModuleDirective,
} from "../directive";
import transformExportDefaultDeclaration from "./export-default-declaration";
import transformExportNamedDeclaration from "./export-named-declaration";
import transformExportNamedFromSource from "./export-named-from-source";
import transformExportNamedSpecifiers from "./export-named-specifiers";
import Generator from "./generator";
import Module from "./module";

export default function transform(program: Program, options: TransformOptions) {
  const { generator, treeshakeImplementation } = options;

  const module = new Module(program);

  // The directive "use server" directive can appear at the top
  // of a module.
  const useServerModuleDirective = getUseServerModuleDirective(program);

  if (useServerModuleDirective) module.remove(useServerModuleDirective);

  traverse(program, {
    ExportAllDeclaration() {
      if (!useServerModuleDirective) return;

      throw new Error(
        'export all (`export *`) declarations are not supported on "use server" modules',
      );
    },
    ExportNamedDeclaration(path) {
      if (!useServerModuleDirective) return;

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
      if (!useServerModuleDirective) return;

      const node = path.node!;
      transformExportDefaultDeclaration(node, module, generator);
    },
    // The directive "use server" directive can appear at the top of a function.
    ArrowFunctionExpression: FunctionLike,
    FunctionDeclaration: FunctionLike,
    FunctionExpression: FunctionLike,
  });

  if (!useServerModuleDirective)
    throw new Error('Expected "use server" directive to exist');

  module.unshift(generator.createRegisterFunctionImport());

  if (treeshakeImplementation)
    program.body = generator.createTreeshakedBody(program.body);
}

export type TransformOptions = {
  generator: Generator;
  treeshakeImplementation: boolean;
};

function FunctionLike(
  path: NodePath<
    FunctionDeclaration | FunctionExpression | ArrowFunctionExpression
  >,
) {
  const node = path.node!;

  if (node.body.type !== "BlockStatement") return;

  const firstBlockNode = node.body.body[0];

  const isUseServerDirective =
    firstBlockNode && getIsUseServerDirective(firstBlockNode);

  if (!isUseServerDirective) return;

  const async = node.async;

  if (!async) throw new Error("server functions must be async");

  throw new Error("use server directive inside functions not supported yet");
}
