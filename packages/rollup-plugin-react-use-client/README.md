> [!WARNING]
> Development of this plugin is paused while a more general api is defined. Consider using [react-just](https://github.com/almadoro/react-just) for your project, building your framework, or open an issue there requesting to continue development with api suggestions.

# rollup-plugin-react-use-client

A Rollup plugin that transforms React's "use client" directive files.

## Usage

```js
// rollup.config.js
import { defineConfig } from "rollup";
import reactUseClient from "rollup-plugin-react-use-client";

export default defineConfig({
  // ...
  plugins: [
    reactUseClient({
      // Customize how module IDs are generated
      moduleId: (id) => id,
      // Choose the function to register client references
      registerClientReference: {
        import: "registerClientReference",
        from: "react-server-dom-BUNDLER/server",
      },
    }),
  ],
});
```

## Options

The plugin accepts the following options:

### `moduleId` (required)

A function that determines how the registered module ids are generated. It receives the module id as a parameter and should return either a string or a Promise that resolves to a string.

```js
({ moduleId: (id) => id }); // Simple pass-through
// or
({ moduleId: async (id) => await someAsyncTransformation(id) });
```

### `registerClientReference` (required)

Specifies how to import the function to register client references. It accepts an object with the following properties:

- `import`: The name of the import to use
- `from`: The module to import from
- `as` (optional): An alias for the imported function

```js
({
  registerClientReference: {
    import: "registerClientReference",
    from: "react-server-dom-BUNDLER/server",
  },
});
```

## Plugin Metadata

The plugin adds metadata to the Rollup module (`meta`) through the `reactUseClient` property:

```ts
{
  reactUseClient: {
    // Indicates if the file was transformed due to "use client" directive
    transformed: boolean;
  }
}
```
