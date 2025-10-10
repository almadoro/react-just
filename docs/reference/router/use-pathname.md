# usePathname

`usePathname` is a hook that returns the current URL's pathname as a string.

```tsx
"use client";

import { usePathname } from "@react-just/router";

function SomeComponent() {
  const pathname = usePathname();

  // URL -> /profile/settings
  // `pathname` -> '/profile/settings'
}
```

## Parameters

```tsx
const pathname = usePathname();
```

`usePathname` takes no parameters.

## Returns

`usePathname` returns the current URL pathname as a string.

```tsx
function usePathname(): string;
```

The hook must be used within a [Router](/reference/router/router) component. Otherwise, it throws an error.

## Example

| Route           | URL            | Returned value |
| --------------- | -------------- | -------------- |
| `/`             | `/`            | `"/"`          |
| `/orders`       | `/orders`      | `"/orders"`    |
| `/orders`       | `/orders?id=2` | `"/orders"`    |
| `/blog/:blogId` | `/blog/1`      | `"/blog/1"`    |
