import vercel from "@react-just/vercel";
import react from "react-just/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), vercel()],
});
