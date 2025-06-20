import { Program as EstreeProgram } from "estree";
import { traverse } from "estree-toolkit";
import transformExportDefaultDeclaration from "./export-default-declaration";
import transformExportNamedDeclaration from "./export-named-declaration";
import transformExportNamedFromSource from "./export-named-from-source";
import transformExportNamedSpecifiers from "./export-named-specifiers";
import { Program, ProgramOptions } from "./program";

export default function transform(
  esProgram: EstreeProgram,
  options: TransformOptions,
) {
  const program = new Program(esProgram, options);

  const useClientDirective = program.getUseClientDirective();

  if (!useClientDirective) return { transformed: false };

  program.removeUseClientDirective();

  program.addRegisterClientReferenceImport();

  traverse(esProgram, {
    ExportAllDeclaration() {
      throw new Error(
        "export all (`export *`) declarations are not supported on client modules",
      );
    },
    ExportNamedDeclaration(path) {
      const node = path.node!;
      if (node.source) {
        transformExportNamedFromSource(node, program);
      } else if (node.declaration) {
        transformExportNamedDeclaration(node, program);
      } else {
        transformExportNamedSpecifiers(node, program);
      }
    },
    ExportDefaultDeclaration(path) {
      const node = path.node!;
      transformExportDefaultDeclaration(node, program);
    },
  });

  if (options.treeshakeImplementation) program.treeshakeImplementation();

  return { transformed: true };
}

export type TransformOptions = ProgramOptions & {
  treeshakeImplementation?: boolean;
};
