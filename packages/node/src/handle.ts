import { HandleFunction, HandleOptions } from "@/types/handle";
import { createHandle as baseCreateHandle } from "react-just/handle.node";

export function createHandle(options: HandleOptions): HandleFunction {
  const {
    App,
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    React,
    renderToPipeableHtmlStream,
    renderToPipeableRscStream,
    resources,
    runWithContext,
  } = options;

  const Root = () =>
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
      React.createElement(App),
    );

  return baseCreateHandle({
    App: Root,
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    React,
    renderToPipeableHtmlStream,
    renderToPipeableRscStream,
    runWithContext,
  });
}
