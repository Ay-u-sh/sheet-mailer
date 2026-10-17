import typescript from "@rollup/plugin-typescript";
import googleAppsScript from "rollup-plugin-google-apps-script";

export default {
  input: "./main.ts",
  output: {
    file: "dist/main.js",
  },
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    googleAppsScript({
      manifest: {
        copy: true,
        srcDir: ".",
      },
    }),
  ],
};