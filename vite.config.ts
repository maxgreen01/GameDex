import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
/*
export default defineConfig({
  optimizeDeps: {
    exclude: ["firebase-admin"],
  },
  build: {
    rollupOptions: {
      external: ["firebase-admin"],
    },
  },
  define: {
    "process.env": {},
  },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    tsconfigPaths: true,
  },
});
*/

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    tsconfigPaths: true,
  },
});
