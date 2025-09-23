import react from "react-just/vite";
import node from "@react-just/node";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), node()],
});
