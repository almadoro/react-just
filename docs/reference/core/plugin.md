# Plugin (`react-just/vite`)

This Vite plugin enables React with React Server Components (RSC) support and provides a development server.

```ts [vite.config.ts] {1,5}
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
});
```

## Options

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
