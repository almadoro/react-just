# Client and Server Components

Only the [App Component](/guide/app-component) must be a Server Component. Other components (and modules) can run on the server, the client, or both. For example, the following `Counter` component is a Client Component:

```tsx [src/Counter.tsx] {1}
"use client";

import React, { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((prev) => prev + 1)}>
      Counter is: {count}
    </button>
  );
}
```

```tsx [src/index.tsx] {2,10}
import type { AppProps } from "react-just";
import Counter from "./Counter";

// Server component
export default async function App(props: AppProps) {
  return (
    <html>
      <body>
        <h1>Hello from the server</h1>
        <Counter />
      </body>
    </html>
  );
}
```

::: info
From the [React documentation](https://react.dev/reference/rsc/use-client): "A component usage is considered a **Client Component** if it is defined in module with `use client` directive or when it is a transitive dependency of a module that contains a `use client` directive. Otherwise, it is a **Server Component**."
:::
