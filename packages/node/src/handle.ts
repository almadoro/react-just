import { HandleFunction, HandleOptions } from "@/types/handle";
import type { AppProps } from "react-just";
import { createHandle as baseCreateHandle } from "react-just/handle.node";

export function createHandle(options: HandleOptions): HandleFunction {
  const {
    App,
    decodePayloadIncomingMessage,
    React,
    renderToPipeableHtmlStream,
    renderToPipeableRscStream,
    resources,
  } = options;

  const Root = (props: AppProps) =>
    React.createElement(
      React.Fragment,
      null,
      resources.js.map((src) =>
        React.createElement("script", {
          key: src,
          src,
          async: true,
        }),
      ),
      resources.css.map((href) =>
        React.createElement("link", {
          key: href,
          href,
          rel: "stylesheet",
          precedence: "default",
        }),
      ),
      React.createElement(App, props),
    );

  return baseCreateHandle({
    App: Root,
    decodePayloadIncomingMessage,
    React,
    renderToPipeableHtmlStream,
    renderToPipeableRscStream,
  });
}
