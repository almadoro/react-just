import { defineConfig } from "vitepress";
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from "vitepress-plugin-group-icons";

export default defineConfig({
  title: "ReactJust",
  description: "React Server Components enabled by Vite",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/getting-started" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [{ text: "Getting Started", link: "/guide/getting-started" }],
      },
      {
        text: "Deploying",
        items: [
          { text: "Platforms", link: "/guide/deploying/platforms" },
          { text: "Node.js (@react-just/node)", link: "/guide/deploying/node" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/almadoro/react-just" },
    ],
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
  },
});
