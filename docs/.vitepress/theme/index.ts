import "virtual:group-icons.css";
import { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Card from "../../components/Card.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Card", Card);
  },
} satisfies Theme;
