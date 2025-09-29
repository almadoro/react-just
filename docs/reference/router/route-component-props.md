---
outline: [2, 3]
---

# RouteComponentProps

`RouteComponentProps` is a TypeScript interface that defines the props automatically passed to components used as the `component` prop on [Route](/reference/router/route) elements.

```tsx
import type { RouteComponentProps } from "@react-just/router";

interface UserParams {
  id: string;
}

export default function UserProfile({
  params,
  pathname,
  search,
  url,
}: RouteComponentProps<UserParams>) {
  return (
    <div>
      <h1>User Profile</h1>
      <p>User ID: {params.id}</p>
      <p>Current path: {pathname}</p>
      <p>Search: {search}</p>
    </div>
  );
}
```

## Definition

```tsx
interface RouteComponentProps<T extends Params = {}> {
  children?: ReactNode;
  params: T;
  pathname: string;
  search: string;
  url: string;
}

type Params = Record<string, string | string[]>;
```

Where:

- `children`: Child components passed through nested routing.
- `params`: Object containing extracted parameters.
- `pathname`: The current URL pathname (e.g., `/users/123`).
- `search`: The current URL search string (e.g., `?tab=profile&sort=name`). Can be parsed with `URLSearchParams`.
- `url`: The complete URL as a string.
