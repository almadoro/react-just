# Routing

By design, React Just lets you use your preferred routing solution, skip routing completely, or even build your own.

## React Just Router

[`@react-just/router`](/reference/router) is a complementary package that includes the routing features that the most common use cases require: static routes, path and wildcard parameters, nested routes and shared layouts.

It has a familiar and simple API. It uses JSX to define routes, provides utility hooks to read route data or programmatically navigate, and allows both Client and Server Components to be used as route components.

### Installation

::: code-group

```bash [npm]
$ npm install @react-just/router
```

```bash [pnpm]
$ pnpm add @react-just/router
```

```bash [Bun]
$ bun add @react-just/router
```

:::

### Example

```tsx [src/index.tsx]
import { Route, Router } from "@react-just/router";
import type { AppProps } from "react-just";
import Home from "./Home";
import OrderDetail from "./OrderDetail";
import OrdersLayout from "./OrdersLayout";

export default async function App({ req }: AppProps) {
  return (
    <html>
      <body>
        <Router url={new URL(req.url)}>
          <Route path="/" component={Home} />
          <Route path="/orders" component={OrdersLayout}>
            <Route path="/:orderId" component={OrderDetail} />
          </Route>
        </Router>
      </body>
    </html>
  );
}
```

```tsx [src/OrdersLayout.tsx]
import type { RouteComponentProps } from "@react-just/router";

export default function OrdersLayout({ children }: RouteComponentProps) {
  return (
    <div>
      <h1>Orders</h1>
      <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
    </div>
  );
}
```

```tsx [src/OrderDetail.tsx]
import type { RouteComponentProps } from "@react-just/router";
import { getOrderDetails } from "./queries";

export default async function OrderDetail({
  params,
}: RouteComponentProps<{ orderId: string }>) {
  const details = await getOrderDetails(params.orderId);
  return (
    <div>
      <h2>Order ID: {params.orderId}</h2>
      <div>{details}</div>
    </div>
  );
}
```

Visit the [Router reference](/reference/router) for more usage details.

## Build Your Own

React Just exposes a client API that lets you load and render a page in RSC format. You can use this to implement your own navigation logic.

```tsx
import { createFromRscFetch, render, RSC_MIME_TYPE } from "react-just/client";

function onNavigation() {
  createFromRscFetch(
    fetch(window.location.href, { headers: { accept: RSC_MIME_TYPE } }),
  ).then((tree) => render(tree));
}
```

Visit the [Low Level APIs reference](/reference/core/low-level-apis) for more information.
