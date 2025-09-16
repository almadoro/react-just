import { defineConfig } from "vitepress";
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from "vitepress-plugin-group-icons";

export default defineConfig({
  title: "React Just",
  description: "React Server Components enabled by Vite",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/getting-started" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Manual Setup", link: "/guide/manual-setup" },
        ],
      },
      {
        text: "Guide",
        items: [
          { text: "App Entry Component", link: "/guide/app-entry-component" },
          { text: "Deployment", link: "/guide/deployment" },
        ],
      },
      {
        text: "Platforms",
        items: [{ text: "Node.js", link: "/platforms/node" }],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/almadoro/react-just" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025-present almadoro",
    },
  },
  sitemap: {
    hostname: "https://reactjust.dev",
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
  },
  ignoreDeadLinks: ["http://localhost:3000", "http://localhost:5173"],
});
