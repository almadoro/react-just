# useParams

`useParams` is a hook that returns the route parameters extracted from the current URL.

```tsx
"use client";

import { useParams } from "@react-just/router";

function SomeComponent() {
  const params = useParams();

  // Route -> /items/:category/:itemId
  // URL -> /items/shoes/1023
  // `params` -> { category: "shoes", itemId: "1023" }
}
```

## Parameters

```tsx
const params = useParams<TReturn>();
```

`useParams` accepts an _optional_ generic type parameter `TReturn`, which overrides the return type. By default, the return type is an empty object `{}`.

## Returns

`useParams` returns an object with the parameters from the currently matched route.

```tsx
function useParams<TReturn extends Params = {}>(): TReturn;

type Params = Record<string, string | string[]>;
```

- Each property corresponds to a parameter in the active route.
- The property value is a string for path parameters, or an array of strings for wildcard parameters.
- The hook must be used within a [Router](/reference/router/router) component. Otherwise, it throws an error.

## Examples

| Route               | URL          | useParams()               |
| ------------------- | ------------ | ------------------------- |
| `/items`            | `/items`     | `{}`                      |
| `/items/:id`        | `/items/1`   | `{ id: "1" }`             |
| `/items/:tag/:item` | `/items/1/2` | `{ tag: "1", item: "2" }` |
| `/items/*rest`      | `/items/1/2` | `{ rest: ["1", "2"] }`    |
