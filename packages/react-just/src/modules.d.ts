// react-server-dom-webpack expects __webpack_require__ and
// __webpack_chunk_load__ to be available.
// These functions must be implemented per environment.
declare function __webpack_require__(id: string): Module;
declare function __webpack_chunk_load__(id: string): Promise<Module>;

type Module = Record<string, unknown>;
