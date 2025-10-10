# Server Functions

You can use the `use server` directive at the top of a module to mark all exported functions as **Server Functions**.

```ts [src/api/posts.ts]
"use server";

export function createComment(formData: FormData) {
  // ...
}

export function deleteComment(id: string) {
  // ...
}
```

```tsx [src/Post.tsx]
import { createComment } from "./api/posts";

function Post() {
  return (
    // ...
    <form action={createComment}>
      <input type="text" name="comment" />
    </form>
  );
}
```

::::warning Function Level Directive
Currently, the `'use server'` directive is only supported at the module level. Support for function-level directives is under development.
::::

To learn more about Server Components, see the [React documentation](https://react.dev/reference/rsc/server-functions).
