# App Component

The App Component serves as the main entry point of your application. By default, React Just looks for the following files in your project root to use as the module containing the App Component:

- `src/index.tsx`
- `src/index.jsx`
- `src/index.ts`
- `src/index.js`

You can override this behavior with the `app` property in the [plugin options](/reference/core).

## Structure

It **must** be a [Server Component](https://react.dev/reference/rsc/server-components), exported as `default` from its module, and always return at least the `html` and `body` tags.

```tsx [src/index.tsx] {1,3,4,6,7}
export default function App() {
  return (
    <html>
      <body>
        <h1>Hello World</h1>
      </body>
    </html>
  );
}
```

## Props

The App Component receives a `req` prop: a standard [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object. You can use these to implement routing, validate authentication, and more.

```tsx [src/index.tsx] {1,5-7}
import type { AppProps } from "react-just";
import getPage from "./getPage";
import getUser from "./getUser";

export default async function App({ req }: AppProps) {
  const page = getPage(req.url);
  const user = await getUser(req.headers);

  return (
    <html>
      <body>
        {page === "/" && (
          <>
            <h1>Home</h1>
            <a href="/about">Go to About</a>
          </>
        )}
        {page === "/about" && (
          <>
            <h1>About</h1>
            <a href="/">Go to Home</a>
          </>
        )}
        <p>You're {!user ? "Unauthenticated" : "Authenticated"}</p>
      </body>
    </html>
  );
}
```
