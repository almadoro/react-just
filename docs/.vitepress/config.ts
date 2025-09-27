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
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference" },
    ],
    sidebar: {
      "/guide": [
        {
          text: "Getting Started",
          link: "/guide/getting-started",
          items: [
            { text: "Installation", link: "/guide/installation" },
            { text: "App Component", link: "/guide/app-component" },
            {
              text: "Client & Server Components",
              link: "/guide/client-and-server-components",
            },
            { text: "Routing", link: "/guide/routing" },
          ],
        },
        {
          text: "Deploy",
          link: "/guide/deploy",
          items: [
            { text: "Node.js", link: "/guide/deploy/node" },
            {
              text: "Vercel",
              link: "/guide/deploy/vercel",
            },
          ],
        },
      ],
      "/reference": [
        {
          text: "Core",
          link: "/reference/core",
          items: [
            {
              text: "Low Level APIs",
              link: "/reference/core/low-level-apis",
            },
          ],
        },
        {
          text: "Router",
          link: "/reference/router",
          items: [
            {
              text: "Link",
              link: "/reference/router/link",
            },
            {
              text: "Route",
              link: "/reference/router/route",
            },
            {
              text: "RouteComponentProps",
              link: "/reference/router/route-component-props",
            },
            {
              text: "Router",
              link: "/reference/router/router",
            },
            {
              text: "useNavigate",
              link: "/reference/router/use-navigate",
            },
            {
              text: "useParams",
              link: "/reference/router/use-params",
            },
            {
              text: "usePathname",
              link: "/reference/router/use-pathname",
            },
            {
              text: "useSearchParams",
              link: "/reference/router/use-search-params",
            },
          ],
        },
        {
          text: "Platforms",
          items: [
            { text: "Node.js", link: "/reference/platforms/node" },
            {
              text: "Vercel",
              link: "/reference/platforms/vercel",
            },
          ],
        },
      ],
    },
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
