---
outline: [2, 3]
---

# Node.js Adapter (`@react-just/node`)

## Plugin Usage

```ts [vite.config.ts] {1,6}
import node from "@react-just/node";
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), node()],
});
```

## CLI Usage

The Node.js adapter provides a CLI command to serve your React Just app.

::: code-group

```bash [npm]
$ npx react-just-node [build] -p [port] [--no-static]
```

```bash [pnpm]
$ pnpm react-just-node [build] -p [port] [--no-static]
```

```bash [bun]
$ bun react-just-node [build] -p [port] [--no-static]
```

:::

### Parameters

- `build` (optional): Path to the build output folder. Defaults to `dist`.
- `-p` or `--port` (optional): Port to run the server on. Defaults to `3000`.
- `--no-static` (optional): Disables serving static files from the `static` directory.

---

### Examples

Serve a custom build folder `output` on port `4000`:

::: code-group

```bash [npm]
$ npx react-just-node output -p 4000
```

```bash [pnpm]
$ pnpm react-just-node output -p 4000
```

```bash [bun]
$ bun react-just-node output -p 4000
```

:::

Run without serving static files:

::: code-group

```bash [npm]
$ npx react-just-node --no-static
```

```bash [pnpm]
$ pnpm react-just-node --no-static
```

```bash [bun]
$ bun react-just-node --no-static
```

:::
