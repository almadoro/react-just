# Getting Started

## Why React Just?

React Server Components ([server components](https://react.dev/reference/rsc/server-components) and [server functions](https://react.dev/reference/rsc/server-functions)) are a specification designed for full-stack React frameworks. Frameworks like **Next.js** and **React Router** implement this specification, but they also add additional features and conventions that often make using **full-stack React more complex than it needs to be**.

**React Just takes a different approach**: it focuses only on the RSC specification. No opinions, no extra conventions, no hidden features, just React Server Components in the simplest possible form. This keeps applications **easy to understand, easy to mantain and easy to deploy anywhere**.

## What is React Just?

React Just is a Vite plugin that easily enables React with React Server Components.

::: warning Early development
React Just is in early development and doesn't support the `'use server'` directive. Support is planned for release by **late October 2025**.
:::

## Try It Out Online

You can try the JavaScript version below, but we recommend opening it in a separate tab via the [JavaScript](https://stackblitz.com/github/almadoro/react-just/tree/main/templates/node-js?file=src%2Findex.jsx&startScript=dev) or [TypeScript](https://stackblitz.com/github/almadoro/react-just/tree/main/templates/node-ts?file=src%2Findex.jsx&startScript=dev) links.

<iframe src="https://stackblitz.com/github/almadoro/react-just/tree/main/templates/node-js?ctl=1&embed=1&file=src%2Findex.jsx&startScript=dev&terminalHeight=18" width="100%" height="540px"></iframe>

::: warning `start` command
The `start` command may not work on StackBlitz, but it works correctly on a Node.js environment.
:::
