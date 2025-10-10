# Authentication (Sessions via Cookie)

This guide demonstrates a simple pattern for implementing authentication in React Just using session cookies. It leverages the [`request`](/reference/core/server#request) and [`response`](/reference/core/server#response) utilities to read and set cookies inside Server Components and Server Functions.

## TL;DR

- Use a session cookie named `session` that stores an opaque, randomly generated session ID.
- On login, create the session and set the cookie.
- On logout, delete the session and clear the cookie.
- To read the current user in any Server Component or Server Function, call `getUser`, which parses the Cookie header to obtain the session ID, and then the user data.

## What you need

- `request` to read the incoming Cookie header.
- `response` to set Set-Cookie on successful login or logout.
- A session store mapping session ID to an user (e.g., a database table or a fast KV store like Redis).
- A cookie utility such as [`cookie`](https://www.npmjs.com/package/cookie), [`tough-cookie`](https://www.npmjs.com/package/tough-cookie), or similar to parse/serialize cookies (recommended).

::::info Security notes

Always set `HttpOnly` and `SameSite` (e.g., `Lax`) for session cookies; add `Secure` in production so cookies are sent only over HTTPS.

Never store credentials or PII in the cookie; store only an opaque session ID.
::::

## Implementation skeleton

Minimal end-to-end pattern. Replace the placeholders `YourAuth`, `YourSessionStore`, `YourUserStore` with your app logic.

### Login and Logout

Start by implementing the login and logout methods with their respective views and components.

```ts [src/auth.ts]
"use server";

import { request, response } from "react-just/server";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";

export async function login(_currentState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const userId = await YourAuth.verify(email, password);

  if (!userId) return { error: "Invalid credentials" };

  const sessionId = await YourSessionStore.create(userId);

  const res = response();
  res.headers.append(
    "Set-Cookie",
    serializeCookie("session", sessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    }),
  );

  return { error: null };
}

export async function logout(): Promise<void> {
  const req = request();
  const cookieHeader = req.headers.get("cookie") ?? "";
  const { session: sessionId } = parseCookie(cookieHeader);

  if (sessionId) await YourSessionStore.destroy(sessionId);

  const res = response();
  res.headers.append(
    "Set-Cookie",
    serializeCookie("session", "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    }),
  );
}
```

#### Login Component

```tsx [src/Login.tsx]
"use client";

import { useActionState } from "react";
import { login } from "./auth";

export default function Login() {
  const [{ error }, action] = useActionState(login, { error: null });

  return (
    <form action={action}>
      <input type="email" name="email" required placeholder="Email" />
      <input type="password" name="password" required placeholder="Password" />
      <button type="submit">Log in</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

#### Logout Component

```tsx [src/LogoutButton.tsx]
import { logout } from "./auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit">Log out</button>
    </form>
  );
}
```

### `getUser` Utility

Create the `getUser` function to retrieve the user while rendering or executing a server function.

```ts [src/auth.ts]
"use server";

interface User {
  id: string;
  email: string;
}

export async function getUser(): Promise<User | null> {
  const req = request();
  const cookieHeader = req.headers.get("cookie") ?? "";
  const { session: sessionId } = parseCookie(cookieHeader);

  if (!sessionId) return null;

  const userId = await YourSessionStore.getUserId(sessionId);
  if (!userId) return null;

  return await YourUserStore.findById(userId);
}
```

```tsx [src/Header.tsx]
import Login from "./Login";
import { LogoutButton } from "./LogoutButton";
import { getUser } from "./auth";

export default async function Header() {
  const user = await getUser();

  return (
    <header>
      {user ? (
        <>
          <span>{user.email}</span>
          <LogoutButton />
        </>
      ) : (
        <Login />
      )}
    </header>
  );
}
```

```ts [src/api/user.ts]
"use server";

import { getUser } from "./auth";

export async function updatePreferences(formData: FormData) {
  const user = await getUser();

  if (!user) return { error: "UNAUTHENTICATED" };

  // Business logic here

  return { error: null };
}
```

See the [Server Utilities reference](/reference/core/server) for more details on `request` and `response`.
