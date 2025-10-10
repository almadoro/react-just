# Client and Server Components

::: info
From the [React documentation](https://react.dev/reference/rsc/use-client#caveats): "A component usage is considered a **Client Component** if it is defined in module with `use client` directive or when it is a transitive dependency of a module that contains a `use client` directive. Otherwise, it is a **Server Component**."
:::

Only the [App Component](/guide/app-component) must be a Server Component. Other components (and modules) can run on the server, the client, or both. For example, the following `Counter` component is a Client Component:

```tsx [src/Counter.tsx] {1}
"use client";

import React, { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((prev) => prev + 1)}>
      Count is: {count}
    </button>
  );
}
```

And the App Component is a Server Component.

```tsx [src/index.tsx] {1,8}
import Counter from "./Counter";

export default async function App() {
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

To learn more about Server Components, see the [React documentation](https://react.dev/reference/rsc/server-components).
