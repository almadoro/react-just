---
outline: [2, 3]
---

# Installation

## Template Installation

Start from a template for JavaScript or TypeScript. Replace `my-project` with your desired directory name.

### JavaScript

::: code-group

```bash [npm]
$ npx degit almadoro/react-just/templates/node-js my-project
```

```bash [pnpm]
$ pnpx degit almadoro/react-just/templates/node-js my-project
```

```bash [bun]
$ bunx degit almadoro/react-just/templates/node-js my-project
```

:::

### TypeScript

::: code-group

```bash [npm]
$ npx degit almadoro/react-just/templates/node-ts my-project
```

```bash [pnpm]
$ pnpx degit almadoro/react-just/templates/node-ts my-project
```

```bash [bun]
$ bunx degit almadoro/react-just/templates/node-ts my-project
```

:::

## Manual Installation

Follow the steps below to manually install React Just in your project.

### Packages Installation

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
The underlying APIs for React Server Components are not yet stable. The [React team warns](https://react.dev/reference/rsc/server-components) that these APIs may change between minor versions.

React Just has been tested with React 19.1 and should work with any patch version (`19.1.x`). Compatibility with future versions is not guaranteed.
:::

Install Vite and React Just as dev dependencies:

::: code-group

```bash [npm]
$ npm install -D vite@7 react-just
```

```bash [pnpm]
$ pnpm add -D vite@7 react-just
```

```bash [Bun]
$ bun add -D vite@7 react-just
```

:::

### TypeScript Configuration (Optional)

For a minimal TypeScript setup, use the following configuration:

```json [tsconfig.json]
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "esnext",
    "jsx": "preserve"
  }
}
```

### Vite Configuration

Create a Vite config file that uses the React Just plugin:

::: code-group

```ts [vite.config.ts]
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
});
```

:::

### Minimal App Component

For a working project, you need to add an [App Component](/guide/app-component). Add a minimal version.

```tsx [src/index.tsx]
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

### Development Server

Start the development server with the `vite` command. For convenience, add the following script to your `package.json`:

```json [package.json]
{
  "scripts": {
    "dev": "vite"
  }
}
```

Then start the development server with:

::: code-group

```bash [npm]
$ npm run dev
```

```bash [pnpm]
$ pnpm dev
```

```bash [Bun]
$ bun dev
```

:::
