import vitejsReact from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import { ReactJustOptions } from "../../types/vite";
import build from "./build";
import dev from "./dev";
import useClient from "./use-client";
import useServer from "./use-server";

const FLIGHT_MIME_TYPE = "text/x-component";

export default function react(options?: ReactJustOptions): PluginOption {
  return [
    build({ app: options?.app, flightMimeType: FLIGHT_MIME_TYPE }),
    dev({ app: options?.app, flightMimeType: FLIGHT_MIME_TYPE }),
    vitejsReact(),
    useClient(),
    useServer(),
  ];
}
