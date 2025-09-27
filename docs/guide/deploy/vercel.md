# Vercel Deployment

Deploy your React Just app on [Vercel](https://vercel.com/).

## Installation

Install the Vercel adapter package in your project:

::: code-group

```bash [npm]
$ npm install @react-just/vercel
```

```bash [pnpm]
$ pnpm add @react-just/vercel
```

```bash [bun]
$ bun add @react-just/vercel
```

:::

Add the plugin in the Vite config file:

```ts [vite.config.ts] {1,6}
import vercel from "@react-just/vercel";
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), vercel()],
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

```bash [bun]
$ bun run build
```

:::

The build process generates a `.vercel/output` directory following Vercel's [Build Output API](https://vercel.com/docs/build-output-api) specification.

For details about the adapter and its output format, see the [Vercel adapter reference](/reference/platforms/vercel).
