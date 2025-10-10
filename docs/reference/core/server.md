# Server Utilities (`react-just/server`)

:::warning Server Only
These APIs can only be used in **Server Components**, **Server Functions**, or their transitive dependencies. They cannot be used in **Client Components** or in code that runs in the browser.
:::

## `request`

Access information about the incoming HTTP request.

```tsx
import { request } from "react-just/server";

async function RequestDetails() {
  const { url, method, headers } = request();

  const parsed = new URL(url);
  const device = await getDevice(headers.get("user-agent"));

  return (
    <div>
      <p>Method: {method}</p>
      <p>Pathname: {parsed.pathname}</p>
      <p>Device: {device}</p>
    </div>
  );
}
```

```ts
"use server";

export async function addComment() {
  const { headers } = request();

  const device = await getDevice(headers.get("user-agent"));

  // ...
}
```

### Parameters

```ts
const req = request();
```

`request` takes no parameters.

### Returns

```ts
function request(): JustRequest;

interface JustRequest {
  readonly headers: Headers;
  readonly method: string;
  readonly url: string;
}
```

`request` returns an object with the following properties:

- `headers`: A standard [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) representing the request headers.
- `method`: The HTTP method of the request (e.g., `GET`, `POST`).
- `url`: The absolute URL of the request. You can create a `URL` instance from it.

## `response`

Access and modify the outgoing HTTP response of a Server Function.

:::warning Server Functions Only
Changes to the response made during rendering will not take effect.
:::

```ts
"use server";

import { response } from "react-just/server";

export async function logout() {
  const res = response();

  res.headers.append("Set-Cookie", "sessionId=; Max-Age=0; Path=/; HttpOnly");
}
```

### Parameters

```ts
const res = response();
```

`response` takes no parameters.

### Returns

```ts
declare function response(): JustResponse;

interface JustResponse {
  readonly headers: Headers;
}
```

`response` returns an object containing the following properties:

- `headers`: A standard [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object representing the response headers. Use it to set headers like `Set-Cookie`.
