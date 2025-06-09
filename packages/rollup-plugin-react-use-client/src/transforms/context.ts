import type { ProgramNode } from "rollup";

export type TransformationContext = {
  program: ProgramNode;
  referencePrefix: string;
  registerClientReferenceIdentifier: string;
  moduleId: string;
};
