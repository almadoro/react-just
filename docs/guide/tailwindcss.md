# Tailwind CSS

Integrate Tailwind with your React Just app.

## Installation

Install Tailwind CSS and its Vite plugin in your project:

::: code-group

```bash [npm]
$ npm install tailwindcss @tailwindcss/vite
```

```bash [pnpm]
$ pnpm add tailwindcss @tailwindcss/vite
```

```bash [bun]
$ bun add tailwindcss @tailwindcss/vite
```

:::

## Configuration

Ensure your `package.json` has `type: "module"` specified to be able to import the Tailwind CSS plugin:

```json [package.json] {2}
{
  "type": "module"
}
```

Add the Tailwind plugin to your Vite config file:

```ts [vite.config.ts] {1,6}
import tailwindcss from "@tailwindcss/vite";
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

## Setup Styles

Create a CSS module (e.g. `src/index.css`) and import Tailwind CSS:

```css [src/index.css]
@import "tailwindcss";
```

Import the CSS module in your App Component:

```tsx [src/index.tsx] {1}
import "./index.css";

export default function App() {
  return (
    <html>
      <body className="min-h-screen">
        <h1 className="w-full py-8 text-4xl font-bold text-center">
          Hello React Just with Tailwind!
        </h1>
      </body>
    </html>
  );
}
```
