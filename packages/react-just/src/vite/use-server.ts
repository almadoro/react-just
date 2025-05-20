import reactUseServer from "rollup-plugin-react-use-server";

export default function useServer() {
  return {
    ...reactUseServer(),
    name: "react-just:use-server",
  };
}
