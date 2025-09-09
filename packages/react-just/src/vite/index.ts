import vitejsReact from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import { ReactJustOptions } from "../../types/vite";
import clientHot from "./client-hot";
import css from "./css";
import entries from "./entries";
import environments from "./environments";
import server from "./server";
import useClient from "./use-client";
import useServer from "./use-server";

const RSC_MIME_TYPE = "text/x-component";

export default function react(options?: ReactJustOptions): PluginOption {
  return [
    useClient(),
    useServer(),
    vitejsReact(),
    environments(),
    entries({ app: options?.app, rscMimeType: RSC_MIME_TYPE }),
    css(),
    clientHot(),
    server({ rscMimeType: RSC_MIME_TYPE }),
  ];
}
