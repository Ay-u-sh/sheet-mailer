import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  root: ".",

  plugins: [
    react(),
    viteSingleFile({
      useRecommendedBuildConfig: true,
    }),
  ],

  build: {
    outDir: path.resolve("dist"),
    emptyOutDir: false,

    rollupOptions: {
      input: path.resolve("editor.html"),
    },
  },
});