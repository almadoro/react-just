---
outline: [2, 3]
---

# Core

These are the high-level APIs from the react-just package that most applications will use.

## Plugin (`react-just/vite`)

This Vite plugin enables React with React Server Components (RSC) support and provides a development server.

### Usage

```ts [vite.config.ts] {1,5}
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
});
```

### Options

```ts
react(options?: ReactJustOptions);

interface ReactJustOptions = {
  app?: string;
};
```

The plugin accepts an _optional_ `options` object with the following properties:

- `app`: Path to the module that exports the App Component. By default, first matching file among:
  - `src/index.tsx`
  - `src/index.jsx`
  - `src/index.ts`
  - `src/index.js`

## Types (`react-just`)

### `AppProps`

The props received by the App Component:

```tsx
import type { AppProps } from "react-just";

export default function App({ req }: AppProps) {
  // ...
}
```

#### Definition

```ts
interface AppProps {
  req: Request;
}
```

Where:

- `req`: A standard [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object representing the incoming HTTP request. Useful for routing, authentication, headers, etc.
