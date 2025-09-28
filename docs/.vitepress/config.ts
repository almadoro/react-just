import { defineConfig } from "vitepress";
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from "vitepress-plugin-group-icons";

const title = "React Just";
const description = "React Server Components made Simple";

export default defineConfig({
  title,
  description,
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "og:description", content: description }],
    ["meta", { name: "og:image", content: "/og-image.png" }],
    ["meta", { name: "og:title", content: title }],
    ["meta", { name: "og:url", content: "https://reactjust.dev" }],
    ["meta", { name: "twitter:description", content: description }],
    ["meta", { name: "twitter:image", content: "/og-image.png" }],
    ["meta", { name: "twitter:title", content: title }],
    ["meta", { name: "twitter:url", content: "https://reactjust.dev" }],
    ["link", { rel: "icon", type: "image/png", href: "/favicon-96x96.png" }],
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["link", { rel: "shortcut icon", href: "/favicon.ico" }],
  ],
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
        {
          text: "Guides",
          items: [{ text: "Tailwind CSS", link: "/guide/tailwindcss" }],
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
