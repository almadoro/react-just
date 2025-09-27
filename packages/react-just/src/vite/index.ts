import vitejsReact from "@vitejs/plugin-react";
import { PluginOption } from "vite";
import { ReactJustOptions } from "../../types/vite";
import build from "./build";
import clientHot from "./client-hot";
import css from "./css";
import entries, {
  CLIENT_ENTRY,
  FIZZ_ENTRY_NODE,
  FLIGHT_ENTRY_NODE,
} from "./entries";
import environments, {
  ENVIRONMENTS as BASE_ENVIRONMENTS,
} from "./environments";
import server from "./server";
import useClient from "./use-client";
import useServer from "./use-server";

export default function react(options?: ReactJustOptions): PluginOption {
  return [
    useClient(),
    useServer(),
    vitejsReact(),
    environments(),
    entries({ app: options?.app }),
    css(),
    clientHot(),
    server(),
    build(),
  ];
}

export const ENVIRONMENTS = {
  CLIENT: BASE_ENVIRONMENTS.CLIENT,
  FIZZ_NODE: BASE_ENVIRONMENTS.FIZZ_NODE,
  FLIGHT_NODE: BASE_ENVIRONMENTS.FLIGHT_NODE,
};

export const ENTRIES = {
  CLIENT: CLIENT_ENTRY,
  FIZZ_NODE: FIZZ_ENTRY_NODE,
  FLIGHT_NODE: FLIGHT_ENTRY_NODE,
};
