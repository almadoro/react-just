# Node.js Deployment

Run your React Just app using the Node.js platform adapter.

## Installation

Install the Node platform package in your project:

::: code-group

```bash [npm]
$ npm install @react-just/node
```

```bash [pnpm]
$ pnpm add @react-just/node
```

```bash [bun]
$ bun add @react-just/node
```

:::

## Start the Server

You can start the production server using the `react-just-node` command.

### Basic Usage

::: code-group

```bash [npm]
$ npx react-just-node
```

```bash [pnpm]
$ pnpm react-just-node
```

```bash [bun]
$ bun react-just-node
```

:::

By default, this will:

- Serve the app from the `./dist` directory
- Listen on port `3000`
- Make your app available at [`http://localhost:3000`](http://localhost:3000)

### Custom Options

You can customize the build output path and the port:

::: code-group

```bash [npm]
$ npx react-just-node [build] -p [port]
```

```bash [pnpm]
$ pnpm react-just-node [build] -p [port]
```

```bash [bun]
$ bun react-just-node [build] -p [port]
```

:::

#### Parameters

- `build` (optional): Path to the build output folder. Defaults to `./dist`
- `-p` or `--port` (optional): Port to run the server on. Defaults to `3000`

---

## Add a Script

For convenience, add a `start` script to your `package.json`:

```json [package.json] {3}
{
  "scripts": {
    "start": "react-just-node"
  }
}
```

Then start your app with:

::: code-group

```bash [npm]
$ npm run start
```

```bash [pnpm]
$ pnpm run start
```

```bash [bun]
$ bun run start
```

:::
