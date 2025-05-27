---
outline: deep
---

# Getting Started

## What is ReactJust?

ReactJust is a [Vite](https://vite.dev/) plugin that enables the use of **React Server Components** ([server components](https://react.dev/reference/rsc/server-components) and [server functions](https://react.dev/reference/rsc/server-functions)) without relying on a framework.

::: warning Early development
ReactJust is in early development and does **not yet** support the `'use server'` directive.

:::

## Installation

Install React packages:

::: code-group

```bash [npm]
$ npm install react@19.1 react-dom@19.1
```

```bash [pnpm]
$ pnpm add react@19.1 react-dom@19.1
```

```bash [Bun]
$ bun add react@19.1 react-dom@19.1
```

::: warning React 19.1.x recommended
The underlying APIs for React Server Components are not yet stable. The [React team warns](https://react.dev/reference/rsc/server-components) that these APIS may change between minor versions.

ReactJust has been tested with React 19.1 and should work with any patch version (19.1.x). Compatibility with future versions is not guaranteed.
:::

Install Vite and the ReactJust plugin as dev dependencies:

::: code-group

```bash [npm]
$ npm install -D vite@6 react-just
```

```bash [pnpm]
$ pnpm add -D vite@6 react-just
```

```bash [Bun]
$ bun add -D vite@6 react-just
```

:::

::: warning Vite 6 recommended
ReactJust relies on Vite's experimental [`Environments`](https://vite.dev/guide/api-environment.html) introduced in Vite 6. Upcoming major versions (Vite 7) may introduce breaking changes to this API.
:::

## Configuring the Plugin

Create a Vite config that uses the plugin:

```js [vite.config.js]
import { defineConfig } from "vite";
import react from "react-just/vite";

export default defineConfig({
  plugins: [react({ app: "src/index.jsx" })],
});
```

::: details Using Typescript
You can use TypeScript for the config file (`vite.config.ts`) and your project files (`src/index.tsx`).

Make sure to include the following options in your tsconfig.json:

```json [tsconfig.json]
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "esnext",
    "jsx": "preserve"
  }
}
```

:::

The `app` option should point to your [app's entry component](#add-an-app-entry), relative to the project root.

## Add an App Entry

Create a React component that serves as the app entry. It must be exported as `default` and include at least the `html` and `body` tags.

```jsx [src/index.jsx] {1,3,4,6,7}
export default function App() {
  return (
    <html>
      <body>
        <h1>Hello, World!</h1>
      </body>
    </html>
  );
}
```

## Running the Development Server

Start the development server with:

::: code-group

```bash [npm]
$ npx vite
```

```bash [pnpm]
$ pnpm vite
```

```bash [Bun]
$ bun vite
```

:::

Alternatively, add a script to package.json:

```json [package.json] {3,}
{
  "scripts": {
    "dev": "vite"
  }
}
```

Then run it with:

::: code-group

```bash [npm]
$ npm run dev
```

```bash [pnpm]
$ pnpm run dev
```

```bash [Bun]
$ bun run dev
```

:::

Your app will be available at [http://localhost:5173](http://localhost:5173).

## Building the App

To build your app for production, run:

::: code-group

```bash [npm]
$ npx vite build
```

```bash [pnpm]
$ pnpm vite build
```

```bash [Bun]
$ bun vite build
```

:::

Or, add a build script in your package.json:

```json [package.json] {4}
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

Then build your app with:

::: code-group

```bash [npm]
$ npm run build
```

```bash [pnpm]
$ pnpm run build
```

```bash [Bun]
$ bun run build
```

:::
