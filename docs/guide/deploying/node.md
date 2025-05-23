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
$ npx react-just-node [build-path] -p <port>
```

```bash [pnpm]
$ pnpm react-just-node [build-path] -p <port>
```

```bash [bun]
$ bun react-just-node [build-path] -p <port>
```

:::

Where:

- `build-path` (optional): Path to the build output directory. Defaults to dist if not specified.
- `port` (required): The port on which to run the server.

## Example

To start the server on port 3000 with the build located in the default ./dist directory:

::: code-group

```bash [npm]
$ npx react-just-node -p 3000
```

```bash [pnpm]
$ pnpm react-just-node -p 3000
```

```bash [bun]
$ bun react-just-node -p 3000
```

:::
Now, you can access your app at `http://localhost:3000`.

## Using a script

You can also add a script to your `package.json` for convenience:

```json [package.json] {5}
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "react-just-node -p 3000"
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
