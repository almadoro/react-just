---
outline: [2, 3]
---

# Route

`Route` is a declarative component that defines route patterns and their corresponding components inside a [Router](/reference/router/router).

```tsx
import { Route, Router } from "@react-just/router";
import Home from "./Home";
import NotFound from "./NotFound";

function Routes({ url }: { url: URL }) {
  return (
    <Router url={url}>
      <Route path="/" component={Home} />
      <Route path="*splat" component={NotFound} />
    </Router>
  );
}
```

:::info
`Route` components are not rendered directly. Instead, the `Router` component processes them to build the routing table.
:::

## Props

```tsx
interface RouteProps {
  children?: RouteChildren;
  component: ComponentType<RouteComponentProps>;
  path: string;
}

type RouteChildren =
  | Iterable<RouteChildren>
  | ReactElement<RouteProps, typeof Route>
  | boolean
  | null
  | undefined;
```

- `children` (optional): Nested route definitions for creating route hierarchies.
- `component`: The React component rendered when the route matches. The component will receive [RouteComponentProps](/reference/router/route-component-props).
- `path`: The URL pattern to match against. Supports static segments, path and wildcard parameters, and optional segments.

:::info Leading Slash
The leading slash is ignored, so `path="about"` and `path="/about"` are equivalent. For consistency, it's recommended to always include the leading slash.
:::

## Path Patterns

### Static Paths

```tsx
<Route path="/" component={Home} />
<Route path="/about" component={About} />
<Route path="/contact" component={Contact} />
```

### Path Parameters

Use `:paramName` to capture dynamic segments:

```tsx
<Route path="/users/:id" component={UserProfile} />
<Route path="/blog/:category/:slug" component={BlogPost} />
```

Path parameters are available via the `params` prop in the component or the [`useParams`](/reference/router/use-params) hook in a client module.

Parameter name must be a valid [identifier](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers) containing only letters, numbers, or underscores `_`.

### Optional Parameters

Add `?` to make a parameter optional:

```tsx
<Route path="/products/:category/:subcategory?" component={Products} />
```

This matches both `/products/electronics` and `/products/electronics/phones`.

### Wildcard Parameters

Use `*paramName` to capture the rest of the path:

```tsx
<Route path="/docs/*sections" component={Documentation} />
<Route path="/files/*path" component={FileViewer} />
```

Wildcard parameters capture all remaining path segments as an array. You can access them through the `params` prop in the component or the [`useParams`](/reference/router/use-params) hook in a client module.

Parameter name must be a valid [identifier](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers) containing only letters, numbers, or underscores `_`.

:::warning Invalid Patterns

The `Router` throws an error if it encounters an invalid pattern:

- Empty path segments: `"/users//profile"`.
- Trailing slashes: `"/about/"`.
- Invalid parameter names: `"/:user-id"`.
  :::

## Nesting

Routes can be nested to define hierarchical routing structures:

```tsx
<Route path="/admin" component={AdminLayout}>
  <Route path="/dashboard" component={AdminDashboard} />
  <Route path="/users" component={AdminUsers} />
  <Route path="/settings" component={AdminSettings} />
</Route>
```

:::warning No Children for Index Routes
Index routes (`path="/"`) cannot have children. Otherwise, the `Router` will throw an error.
:::
