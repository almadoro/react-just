# App Component

The App Component serves as the main entry point of your application. By default, React Just looks for the following files in your project root to use as the module containing the App Component:

- `src/index.tsx`
- `src/index.jsx`
- `src/index.ts`
- `src/index.js`

You can override this behavior with the `app` property in the [plugin options](/reference/core/plugin).

It **must** be a Server Component, exported as `default` from its module, and always return at least the `html` and `body` tags.

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
