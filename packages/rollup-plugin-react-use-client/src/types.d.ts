import { Plugin } from "rollup";

export default function reactUseClient(options: ReactUseClientOptions): Plugin;

export type ReactUseClientOptions = {
  /**
   * Returns the module ID that will be used in the registerClientReference
   * call.
   */
  moduleId: (code: string, id: string) => string | Promise<string>;
  /**
   * Specifies the import to be used when registering client references.
   */
  registerClientReference: ImportOptions;
};

type ImportOptions = { import: string; as?: string; from: string };

declare module "rollup" {
  interface CustomPluginOptions {
    reactUseClient: {
      /**
       * The use client directive was found and the file was transformed.
       */
      transformed: boolean;
    };
  }
}
