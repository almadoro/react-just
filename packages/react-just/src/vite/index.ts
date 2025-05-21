import react from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import build from "./build";
import dev from "./dev";
import { ReactJustOptions } from "./types";
import useClient from "./use-client";
import useServer from "./use-server";

const FLIGHT_MIME_TYPE = "text/x-component";

export default function reactJust(options: ReactJustOptions): PluginOption {
  return [
    build({ app: options.app, flightMimeType: FLIGHT_MIME_TYPE }),
    dev({ app: options.app, flightMimeType: FLIGHT_MIME_TYPE }),
    react(),
    useClient(),
    useServer(),
  ];
}
