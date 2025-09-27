# Vercel Adapter (`@react-just/vercel`)

## Plugin Usage

```ts [vite.config.ts] {1,6}
import vercel from "@react-just/vercel";
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), vercel()],
});
```

### Output

When you run `vite build`, the adapter generates a `.vercel/output` directory in your project root. This folder conforms to Vercel’s Build Output API specification and can be deployed directly to Vercel without additional configuration.
