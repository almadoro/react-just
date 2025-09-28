---
outline: [2, 3]
---

# useNavigate

`useNavigate` is a hook that returns a function to programmatically change routes.

```tsx
"use client";

import { useNavigate } from "@react-just/router";

function SomeComponent() {
  const navigate = useNavigate();

  return <button onClick={() => navigate("/home")}>Go Home</button>;
}
```

## Parameters

```tsx
const navigate = useNavigate();
```

`useNavigate` takes no parameters.

## Returns

`useNavigate` returns a navigate function with the following signatures:

```tsx
function navigate(href: string, options?: NavigateOptions): void;
function navigate(delta: number): void;

interface NavigateOptions {
  replace?: boolean;
}
```

The hook must be used within a [Router](/reference/router/router) component. Otherwise, it throws an error.

### Parameters

**Navigate to URL**

- `href`: The URL path to navigate to. Can be a relative URL.
- `options`: Navigation options
  - `replace`: Replace the current entry in the history stack instead of pushing a new one

**Navigate by delta**

- `delta`: A positive or negative number of entries to move in the history stack (negative moves back, positive moves forward).

## Examples

### Navigate to Another Route

```tsx
"use client";

import { useNavigate } from "@react-just/router";

export default function Home() {
  const navigate = useNavigate();

  const goToAbout = () => navigate("/about");
  const goToContact = () => navigate("/contact");

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={goToAbout}>About Us</button>
      <button onClick={goToContact}>Contact</button>
    </div>
  );
}
```

### Navigate Back and Forward in History

```tsx
"use client";

import { useNavigate } from "@react-just/router";

export default function Navigation() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate(-1)}>Go Back</button>
      <button onClick={() => navigate(1)}>Go Forward</button>
      <button onClick={() => navigate(-2)}>Go back 2 pages</button>
    </div>
  );
}
```

### Navigate with Replace Option

```tsx
"use client";

import { useNavigate, useSearchParams } from "@react-just/router";

export default function Search() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = (e.target as HTMLFormElement).query.value.trim();
    const search = new URLSearchParams({ q });
    if (q) navigate("?" + search.toString(), { replace: true });
  };

  return (
    <form onSubmit={handleSearch}>
      <h1>Showing results for: {query}</h1>
      <input type="search" placeholder="Search..." name="query" />
      <button type="submit">Search</button>
    </form>
  );
}
```
