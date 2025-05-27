# Deployment

## Build

To deploy your app, you need to build it using the `vite build` command. Add a build script to your package.json for convenience if you haven't already:

```json [package.json] {3}
{
  "scripts": {
    "build": "vite build"
  }
}
```

And then build your app with:

::: code-group

```bash [npm]
$ npm run build
```

```bash [pnpm]
$ pnpm run build
```

```bash [Bun]
$ bun run build
```

:::

## Choose Your Deployment Platform

ReactJust is designed to be platform-agnostic. You can deploy your app to any platform that supports running JavaScript in some form.

You can use prebuilt platform packages to deploy your app with minimal configuration, or even [create your own](/advanced/custom-platform.md). The following platforms are currently available or in development:

| Platform   | Status                       | Package                                  |
| ---------- | ---------------------------- | ---------------------------------------- |
| Node.js    | :white_check_mark: Available | [`@react-just/node`](/platforms/node.md) |
| Bun        | :hourglass: Planned          | `@react-just/bun`                        |
| Cloudflare | :hourglass: Planned          | `@react-just/cloudflare`                 |
| Vercel     | :hourglass: Planned          | `@react-just/vercel`                     |
| Netlify    | :hourglass: Planned          | `@react-just/netlify`                    |
| AWS        | :hourglass: Planned          | `@react-just/aws`                        |
