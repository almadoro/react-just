# Core

## Plugin Usage (`react-just/vite`)

```ts [vite.config.ts] {1,5}
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
});
```

### Options

The plugin accepts an optional `options` object:

```ts
react(options);
```

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

#### Properties

- `req`: Type [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request). The incoming request object. Useful for routing, authentication, headers, etc.
