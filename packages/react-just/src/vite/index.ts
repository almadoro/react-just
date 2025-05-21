import react from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import build from "./build";
import dev from "./dev";
import { ReactJustOptions } from "./types";
import useClient from "./use-client";
import useServer from "./use-server";

export default function reactJust(options: ReactJustOptions): PluginOption {
  return [
    build({ app: options.app }),
    dev({ app: options.app }),
    react(),
    useClient(),
    useServer(),
  ];
}
