# Node.js (`@react-just/node`)

## Installation

Install the Node platform package:

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

## CLI

You can start the server using the following command:

::: code-group

```bash [npm]
$ npx react-just-node [build-path] -p [port]
```

```bash [pnpm]
$ pnpm react-just-node [build-path] -p [port]
```

```bash [bun]
$ bun react-just-node [build-path] -p [port]
```

:::

Where:

- `build-path` (optional): Path to the build output directory. Defaults to `./dist`.
- `port` (optional): The port on which to run the server. Defaults to `3000`.

## Example

### Default configuration

To start the server with the default configuration run:

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

This will serve the app in the `./dist` directory on port `3000` (accessible at [`http://localhost:3000`](http://localhost:3000)).

### Custom configuration

To server the app in the `./build` directory on port `5000`:

::: code-group

```bash [npm]
$ npx react-just-node build -p 5000
```

```bash [pnpm]
$ pnpm react-just-node build -p 5000
```

```bash [bun]
$ bun react-just-node build -p 5000
```

:::

## Using a script

You can also add a script to your `package.json` for convenience:

```json [package.json] {5}
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "react-just-node"
  }
}
```

Then run it with:

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
