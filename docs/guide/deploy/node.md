# Node.js Deployment

Deploy your React Just app using a Node.js environment.

## Installation

Install the Node.js adapter package in your project:

::: code-group

```bash [npm]
$ npm install @react-just/node
```

```bash [pnpm]
$ pnpm add @react-just/node
```

```bash [bun]
$ bun add @react-just/node
```

:::

Add the plugin in the Vite config file:

```ts [vite.config.ts] {1,6}
import node from "@react-just/node";
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), node()],
});
```

## Building the App

Build the app with the `vite build` command. For convenience, add the following script to your `package.json`:

```json [package.json] {3}
{
  "scripts": {
    "build": "vite build"
  }
}
```

Then build the app with:

::: code-group

```bash [npm]
$ npm run build
```

```bash [pnpm]
$ pnpm build
```

```bash [Bun]
$ bun run build
```

:::

By default, the build will be placed in the `dist` directory. You can change it with the `build.outDir` Vite config option:

```ts [vite.config.ts] {7}
import node from "@react-just/node";
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), node()],
  build: { outDir: "lib" },
});
```

### The `static` Folder

Static assets are emitted to the `static` folder in the output directory. These can be served directly (e.g., from object storage like S3 behind a CDN).

## Start the Server

Start a server using the `react-just-node` command.

::: code-group

```bash [npm]
$ npx react-just-node
```

```bash [pnpm]
$ pnpm react-just-node
```

```bash [bun]
$ bun react-just-node
```

:::

By default, this will:

- Serve the build in the `dist` directory.
- Statically serve the files in the `dist/static` directory.
- Listen on port `3000`, making your app available at [`http://localhost:3000`](http://localhost:3000).

### Add a Script

For convenience, add a `start` script to your `package.json`:

```json [package.json] {3}
{
  "scripts": {
    "start": "react-just-node"
  }
}
```

Then start your app with:

::: code-group

```bash [npm]
$ npm run start
```

```bash [pnpm]
$ pnpm start
```

```bash [bun]
$ bun start
```

:::

For details about the adapter and CLI options, see the [Node.js adapter reference](/reference/platforms/node).
