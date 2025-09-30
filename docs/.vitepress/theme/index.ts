import "virtual:group-icons.css";
import { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Card from "./components/Card.vue";
import Home from "./components/Home.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Card", Card);
    app.component("Home", Home);
  },
} satisfies Theme;
