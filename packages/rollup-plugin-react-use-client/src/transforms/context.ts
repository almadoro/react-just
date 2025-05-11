import type { Scope } from "estree-toolkit";
import type { ProgramNode } from "rollup";

export type TransformationContext = {
  program: ProgramNode;
  scope: Scope;
  implementationPrefix: string;
  registerClientReferenceIdentifier: string;
  moduleId: string;
};
