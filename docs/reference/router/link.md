---
outline: [2, 3]
---

# Link

`Link` is a client component that provides declarative navigation between routes with optimized behavior for single-page applications.

## Usage

```tsx
"use client";

import { Link } from "@react-just/router";

function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/contact">Contact</Link>
    </nav>
  );
}
```

## Props

```tsx
interface LinkProps extends React.DOMAttributes<HTMLAnchorElement> {
  href: string;
  replace?: boolean;
}
```

- `href` (required): The URL path to navigate to. Can be a relative or absolute URL.
- `replace` (optional): Replace the current entry in the history stack instead of pushing a new one. Defaults to `false`.
- All standard anchor element attributes and event handlers are supported.

## Behavior

The `Link` component renders as an anchor tag but intercepts clicks to provide client-side navigation. It automatically handles:

- **External links**: Links to different origins are handled normally (full page navigation).
- **Modified clicks**: Clicks with modifier keys (Ctrl, Cmd, Shift, Alt) open in new tabs/windows.
- **Special targets**: Links with `target` attributes other than `_self` are handled normally.
- **Downloads**: Links with `download` attributes are handled normally.

## Examples

### Basic Navigation

```tsx
import { Link } from "@react-just/router";

export default function Navigation() {
  // Current URL -> /shop/shirts/item3
  return (
    <nav>
      <Link href=".">All Shirts</Link>
      <Link href="./item1">See Shirt 1</Link>
      <Link href="./item2">See Shirt 2</Link>
      <Link href="/shop">Back to Store</Link>
    </nav>
  );
}
```

### Navigation with Replace

```tsx
import { Link } from "@react-just/router";

export default function TabsHeader() {
  return (
    <div>
      <Link href="?tab=overview" replace>
        Overview
      </Link>
      <Link href="?tab=details" replace>
        Details
      </Link>
      <Link href="?tab=settings" replace>
        Settings
      </Link>
    </div>
  );
}
```
