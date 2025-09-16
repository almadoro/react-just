---
outline: deep
next:
  text: App Entry
  link: /guide/app-entry-component
---

# Getting Started

## What is React Just?

React Just is a [Vite](https://vite.dev/) plugin that enables the use of **React Server Components** ([server components](https://react.dev/reference/rsc/server-components) and [server functions](https://react.dev/reference/rsc/server-functions)) without relying on a full framework.

::: warning Early development
React Just is in early development and does **not yet** support the `'use server'` directive. Support is planned for release by **mid June 2025**.
:::

## Try It Out Online

Run it directly in your browser. Explore the project's files to understand how it works. You can try the JavaScript version below, but we recommend opening it in a separate tab using the following links for [JavaScript](https://stackblitz.com/github/almadoro/react-just/tree/main/templates/node-js?file=src%2Findex.jsx&startScript=dev) or [TypeScript](https://stackblitz.com/github/almadoro/react-just/tree/main/templates/node-ts?file=src%2Findex.jsx&startScript=dev).

<iframe src="https://stackblitz.com/github/almadoro/react-just/tree/main/templates/node-js?ctl=1&embed=1&file=src%2Findex.jsx&startScript=dev&terminalHeight=18" width="100%" height="540px"></iframe>

::: warning `start` command may not work on StackBlitz
The start command may not work on StackBlitz, but it works correctly in a local environment.
:::

## Start From Template

Start from a template for JavaScript or TypeScript. Replace `my-project` with your desired directory name.

### JavaScript

::: code-group

```bash [npm]
$ npx degit almadoro/react-just/templates/node-js my-project
```

```bash [pnpm]
$ pnpm dlx degit almadoro/react-just/templates/node-js my-project
```

```bash [bun]
$ bunx degit almadoro/react-just/templates/node-js my-project
```

:::

### TypeScript

::: code-group

```bash [npm]
$ npx degit almadoro/react-just/templates/node-ts my-project
```

```bash [pnpm]
$ pnpm dlx degit almadoro/react-just/templates/node-ts my-project
```

```bash [bun]
$ bunx degit almadoro/react-just/templates/node-ts my-project
```

:::

## Manual Setup

If you prefer to set up your project manually, go to the [Manual Setup](/guide/manual-setup) page.
