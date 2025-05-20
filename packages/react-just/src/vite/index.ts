import react from "@vitejs/plugin-react";
import build from "./build";
import dev from "./dev";
import useClient from "./use-client";

type ReactJustOptions = {
  entry: string;
};

export default function reactJust(options: ReactJustOptions) {
  return [
    build({ entry: options.entry }),
    dev({ entry: options.entry }),
    react(),
    useClient(),
  ];
}
