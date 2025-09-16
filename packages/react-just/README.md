# `react-just`

Vite plugin to enable React with React Server Components support.

## Documentation

See [reactjust.dev](https://reactjust.dev)

## Usage

```ts
// vite.config.ts
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
});
```

```tsx
// src/index.tsx
export default function App() {
  return (
    <html>
      <body>
        <h1>Hello from a server component</h1>
      </body>
    </html>
  );
}
```
