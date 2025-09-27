import { PipeableStream } from "@/types/shared";
import { PassThrough, Readable, Transform, Writable } from "node:stream";
import React, { use } from "react";
import { renderToPipeableStream as baseRenderToPipeableStream } from "react-dom/server.node";
import { createFromNodeStream } from "react-server-dom-webpack/client.node";
import { registerModuleExport } from "../modules";
import {
  BinaryDataChunk,
  RSC_STREAM_BINARY_DATA,
  RSC_STREAM_STRING_DATA,
  RSC_STREAM_WINDOW_IDENTIFIER,
  StringDataChunk,
} from "../rsc-stream";

export function registerClientReference(
  implementation: unknown,
  moduleId: string | number,
  exportName: string | number,
): unknown {
  registerModuleExport(implementation, moduleId, exportName);
  return implementation;
}

export function renderToPipeableStream(
  rscStream: PipeableStream,
): PipeableStream {
  const [rscReadable1, rscReadable2] = duplicateStream(rscStream);

  const htmlStream = transformRscToHtmlStream(rscReadable1);

  const transformStream = createRscStreamHtmlInjectionTransform(rscReadable2);

  htmlStream.pipe(transformStream);

  return {
    pipe<T extends Writable>(destination: T) {
      return transformStream.pipe(destination);
    },
    abort(reason?: unknown) {
      rscStream.abort(reason);
      rscReadable1.destroy();
      rscReadable2.destroy();
      htmlStream.abort(reason);
      transformStream.destroy();
    },
  };
}

function duplicateStream(stream: PipeableStream) {
  const stream1 = new PassThrough();
  const stream2 = new PassThrough();
  stream.pipe(
    new Writable({
      write(chunk, _, callback) {
        stream1.write(chunk);
        stream2.write(chunk);
        callback();
      },
      final(callback) {
        stream1.end();
        stream2.end();
        callback();
      },
    }),
  );

  return [stream1, stream2];
}

function transformRscToHtmlStream(stream: Readable) {
  const thenable = createFromNodeStream(stream, {
    moduleMap: serverMap,
    serverModuleMap: null,
    moduleLoading: null,
  });

  const Component = () => use(thenable) as React.ReactNode;

  return baseRenderToPipeableStream(React.createElement(Component));
}

const serverMap = new Proxy(
  {},
  {
    get(_, prop) {
      if (typeof prop !== "string") return null;
      const [, name] = prop.split("#");
      return { [name]: { id: prop, chunks: [], name, async: false } };
    },
  },
);

function createRscStreamHtmlInjectionTransform(rscStream: Readable) {
  return new Transform({
    transform(chunk, _, callback) {
      if (CLOSING_CHUNK_BUFFER.equals(chunk)) return callback();
      callback(null, chunk);
    },
    async flush(callback) {
      writeInitializer(this);
      const decoder = new TextDecoder("utf-8", { fatal: true });
      for await (const chunk of rscStream) {
        writeRscStream(this, chunk, decoder);
      }
      this.push(CLOSING_CHUNK_BUFFER);
      callback();
    },
  });
}

// React will emit this as the last chunk once all pending tasks are completed
// https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/server/ReactFizzConfigDOM.js#L5591
const CLOSING_CHUNK = "</body></html>";
const CLOSING_CHUNK_BUFFER = Buffer.from(CLOSING_CHUNK);

const encoder = new TextEncoder();

function writeInitializer(stream: Readable) {
  stream.push(
    encoder.encode(
      `<script>window.${RSC_STREAM_WINDOW_IDENTIFIER}=window.${RSC_STREAM_WINDOW_IDENTIFIER} || []</script>`,
    ),
  );
}

function writeRscStream(
  stream: Readable,
  chunk: Uint8Array,
  decoder: TextDecoder,
) {
  const dataChunk = getDataChunk(chunk, decoder);
  const payload = htmlEscapeJsonString(JSON.stringify(dataChunk));
  stream.push(
    encoder.encode(
      `<script>window.${RSC_STREAM_WINDOW_IDENTIFIER}.push(${payload})</script>`,
    ),
  );
}

function getDataChunk(chunk: Uint8Array, decoder: TextDecoder) {
  try {
    const str = decoder.decode(chunk, { stream: true });
    return getStringDataChunk(str);
  } catch {
    return getBinaryDataChunk(chunk);
  }
}

function getStringDataChunk(str: string): StringDataChunk {
  return [RSC_STREAM_STRING_DATA, str];
}

function getBinaryDataChunk(chunk: Uint8Array): BinaryDataChunk {
  const base64 = btoa(String.fromCodePoint(...chunk));
  return [RSC_STREAM_BINARY_DATA, base64];
}

const ESCAPE_LOOKUP: Record<string, string> = {
  "&": "\\u0026",
  ">": "\\u003e",
  "<": "\\u003c",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

const ESCAPE_REGEX = /[&><\u2028\u2029]/g;

// Same escapings are used by react
// https://github.com/facebook/react/blob/main/packages/react-dom-bindings/src/server/ReactFizzConfigDOM.js#L5077
function htmlEscapeJsonString(str: string) {
  return str.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
}
