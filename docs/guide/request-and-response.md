# Request and Response

You can use [`request`](/reference/core/server#request) inside **Server Components**, **Server Functions**, or their dependencies to access request details during server rendering or while running a Server Function.

```tsx [src/Profile.tsx]
import { request } from "react-just/server";

function Profile() {
  const { url } = request();

  // Use the URL to render the selected profile tab
  const tab = getSelectedTab(url);
}
```

```ts [src/api.ts]
"use server";

import { request } from "react-just/server";

export async function editPreferences() {
  const { headers } = request();

  // Use the cookie header to read the session
  const session = await getSession(headers.get("cookie"));
}
```

You can use [`response`](/reference/core/server#response) inside **Server Functions** or their dependencies to modify the HTTP response.

```ts [src/actions.ts]
"use server";

import { response } from "react-just/server";

export async function saveSettings() {
  const { headers } = response();

  // Set a cookie with rendering preferences
  headers.append("Set-Cookie", getThemeSetCookie());
}
```

Visit the [Server Utilities reference](/reference/core/server) for more usage details.
