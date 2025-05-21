import reactUseServer from "rollup-plugin-react-use-server";
import type { Plugin } from "vite";

export default function useServer(): Plugin {
  return {
    ...reactUseServer(),
    name: "react-just:use-server",
  };
}
