# useSearchParams

`useSearchParams` is a hook that returns the current URL’s query parameters as a [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object.

```tsx
"use client";

import { useSearchParams } from "@react-just/router";

export default function SearchBar() {
  const searchParams = useSearchParams();

  const query = searchParams.get("q");
  const type = searchParams.get("type");

  // URL -> /search?q=duck&type=image
  // query -> "duck"
  // type -> "image"
}
```

## Parameters

```tsx
const searchParams = useSearchParams();
```

`useSearchParams` takes no parameters.

## Returns

`useSearchParams` returns a Web [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object, which provides methods to read values from the URL's query string.

```tsx
function useSearchParams(): URLSearchParams;
```

- The object is **read-only** in practice: calling modifying methods (like .set() or .delete()) does not update the URL or trigger a navigation.
- The hook must be used within a [Router](/reference/router/router) component. Otherwise, it throws an error.
