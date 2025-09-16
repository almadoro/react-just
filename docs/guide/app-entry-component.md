# App Entry Component

## Minimal Structure

The starting point of your app is the entry component. It must be exported as `default` from its module and include at least the `html` and `body` tags.

```tsx [src/index.tsx] {1,3,4,6,7}
export default function App() {
  return (
    <html>
      <body>
        <h1>Hello World</h1>
      </body>
    </html>
  );
}
```

## Request Object

The entry component receives a React Just `Request` object as the `req` prop. This object is generated on each request:

```tsx [src/index.tsx] {1,3}
import type { AppEntryProps } from "react-just/server";

export default function App({ req }: AppEntryProps) {
  return (
    <html>
      <body>
        <h1>Hello World</h1>
      </body>
    </html>
  );
}
```

The `Request` object has the following properties:

```ts
interface Request {
  url: URL; // Web standard URL object
  headers: Headers; // Web standard Headers object
}
```

You can use these properties to implement routing, validate authentication, and more.

```tsx [src/index.tsx] {5,10-21}
import type { AppEntryProps } from "react-just/server";

export default function App({ req }: AppEntryProps) {
  // Removes leading and trailing `/`
  const pathname = req.url.pathname.replace(/^\/|\/$/g, "");

  return (
    <html>
      <body>
        {pathname === "" && (
          <>
            <h1>Home</h1>
            <a href="/about">Go to About</a>
          </>
        )}
        {pathname === "about" && (
          <>
            <h1>About</h1>
            <a href="/">Go to Home</a>
          </>
        )}
      </body>
    </html>
  );
}
```

## Environment and Client Components

The entry component runs only on the server. You can control the environment in which other components or modules run using the `use client` directive. This enables you to create interactive client-side behavior while keeping the rest of the app server-rendered. For example, the following `Counter` component will be executed on the client:

```tsx [src/Counter.tsx] {1}
"use client";

import React, { useState } from "react";

export default function Counter({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((prev) => prev + 1)}>
      {children} {count}
    </button>
  );
}
```

```tsx [src/index.tsx] {2,15,22}
import type { AppEntryProps } from "react-just/server";
import Counter from "./Counter";

export default function App({ req }: AppEntryProps) {
  // Removes leading and trailing `/`
  const pathname = req.url.pathname.replace(/^\/|\/$/g, "");

  return (
    <html>
      <body>
        {pathname === "" && (
          <>
            <h1>Home</h1>
            <a href="/about">Go to About</a>
            <Counter>Home count is:</Counter>
          </>
        )}
        {pathname === "about" && (
          <>
            <h1>About</h1>
            <a href="/">Go to Home</a>
            <Counter>About count is:</Counter>
          </>
        )}
      </body>
    </html>
  );
}
```

## Entry Module Path

By default, React Just will look for the following files from the root of your project to use as the entry component module:

- `src/index.tsx`
- `src/index.jsx`
- `src/index.ts`
- `src/index.js`

You can override the default entry component module path with the `app` option in the plugin configuration.

```js [vite.config.js]
import { defineConfig } from "vite";
import react from "react-just/vite";

export default defineConfig({
  plugins: [react({ app: "src/my-app.tsx" })],
});
```
