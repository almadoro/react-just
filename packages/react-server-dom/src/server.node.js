import * as pkg from "react-server-dom-webpack/server.node";

export const {
  renderToPipeableStream,
  decodeReplyFromBusboy,
  decodeReply,
  decodeAction,
  decodeFormState,
  registerServerReference,
  registerClientReference,
  createClientModuleProxy,
  createTemporaryReferenceSet,
} = pkg;
