---
outline: [2, 3]
---

# Router

`Router` is a component that handles route matching and renders the appropriate route component for a given URL.

```tsx
import { Router, Route } from "@react-just/router";
import Home from "./components/Home";
import About from "./components/About";

export default function Routes({ url }: { url: URL }) {
  return (
    <Router url={url}>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
    </Router>
  );
}
```

:::warning Server Component
The `Router` component must be used as a Server Component.
:::

## Props

```tsx
interface RouterProps {
  children?: RouteChildren;
  url: URL;
}

type RouteChildren =
  | Iterable<RouteChildren>
  | ReactElement<RouteProps, typeof Route>
  | boolean
  | null
  | undefined;
```

- `children` (optional): Route components that define the application's routing structure. Can include `Route` components or values resulting from conditional rendering, such as `boolean`, `null`, or `undefined`.
- `url`: A `URL` object representing the current request URL. Typically created from the `url` property of the `req` prop in the App Component.

## Examples

### Basic Routing with Fallback Route

```tsx
import { Router, Route } from "@react-just/router";
import type { AppProps } from "react-just";
import About from "./components/About";
import Contact from "./components/Contact";
import Home from "./components/Home";
import NotFound from "./components/NotFound";

export default function App({ req }: AppProps) {
  return (
    <Router url={new URL(req.url)}>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="*splat" component={NotFound} />
    </Router>
  );
}
```

:::info Fallback Route
`*splat` matches any unmatched path and passes it as a parameter named `splat`.
:::

### Nested Routing with Parameters

```tsx
import { Router, Route } from "@react-just/router";
import AdminLayout from "./components/AdminLayout";
import FileExplorer from "./components/FileExplorer";
import UserProfile from "./components/UserProfile";
import UsersList from "./components/UsersList";

export default function Routes({ url }: { url: URL }) {
  return (
    <Router url={url}>
      <Route path="/admin" component={AdminLayout}>
        <Route path="/users" component={UsersList} />
        <Route path="/users/:userId" component={UserProfile} />
        <Route path="/files/*path" component={FileExplorer} />
      </Route>
    </Router>
  );
}
```

### Conditional Routes

```tsx
import { Router, Route } from "@react-just/router";
import AdminDashboard from "./components/AdminDashboard";
import Home from "./components/Home";
import UserDashboard from "./components/UserDashboard";

export default function Routes({ url, user }: { url: URL; user: User }) {
  return (
    <Router url={url}>
      <Route path="/" component={Home} />
      {user.isAdmin && <Route path="/admin" component={AdminDashboard} />}
      <Route path="/dashboard" component={UserDashboard} />
    </Router>
  );
}
```

