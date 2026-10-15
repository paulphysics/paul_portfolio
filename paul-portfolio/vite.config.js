import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// Multi-page build: the home page plus the /about/ page.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        about: fileURLToPath(new URL("./about/index.html", import.meta.url)),
      },
    },
  },
});
