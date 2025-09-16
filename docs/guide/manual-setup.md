# Manual Setup

React Just is designed to work with minimal setup and zero configuration. Follow the steps below to set it up in your project.

## Installation

Install React and React Just packages:

::: code-group

```bash [npm]
$ npm install react@19.1 react-dom@19.1 react-just
```

```bash [pnpm]
$ pnpm add react@19.1 react-dom@19.1 react-just
```

```bash [Bun]
$ bun add react@19.1 react-dom@19.1 react-just
```

::: warning React 19.1.x recommended
The underlying APIs for React Server Components are not yet stable. The [React team warns](https://react.dev/reference/rsc/server-components) that these APIs may change between minor versions.

React Just has been tested with React 19.1 and should work with any patch version (`19.1.x`). Compatibility with future versions is not guaranteed.
:::

::: info Why is react-just not a dev dependency?
React Just is used in your production code. Even if you don’t directly import `react-just` in your source files, it’s required by the code generated.
:::

Install Vite as dev dependency:

::: code-group

```bash [npm]
$ npm install -D vite@6
```

```bash [pnpm]
$ pnpm add -D vite@6
```

```bash [Bun]
$ bun add -D vite@6
```

:::

::: warning Vite 6 recommended
React Just relies on Vite's experimental [`Environments`](https://vite.dev/guide/api-environment.html) API introduced in Vite 6. Upcoming major versions (Vite 7) may introduce breaking changes to this API.
:::

## TypeScript Configuration (Optional)

If you want to use TypeScript, you can start with the following base configuration:

```json [tsconfig.json]
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "esnext",
    "jsx": "preserve"
  }
}
```

## Configure Vite

Create a Vite config file that uses the React Just plugin:

::: code-group

```js [vite.config.js]
import { defineConfig } from "vite";
import react from "react-just/vite";

export default defineConfig({
  plugins: [react()],
});
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import react from "react-just/vite";

export default defineConfig({
  plugins: [react()],
});
```

:::

## Add an App Entry

Create a the app entry component. It must be exported as `default` and return at least the `html` and `body` tags.

::: code-group

```jsx [src/index.jsx] {4,6,7,9,10}
/**
 * @param {import('react-just/server').AppEntryProps} props
 */
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

```tsx [src/index.tsx] {3,5,6,8,9}
import { AppEntryProps } from "react-just/server";

export default function App(props: AppEntryProps) {
  return (
    <html>
      <body>
        <h1>Hello, World!</h1>
      </body>
    </html>
  );
}
```

:::

## Development Server

Start the development server with the `vite` command. For convenience, add the following script to your `package.json`:

```json [package.json] {3}
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
$ pnpm run dev
```

```bash [Bun]
$ bun run dev
```

:::
