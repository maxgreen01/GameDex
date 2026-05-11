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

const backendUrl = process.env.VITE_BACKEND_URL || "http://localhost:3000";

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    proxy: {
      // http://localhost:5173/api -> http://localhost:3000/api
      "/api": backendUrl,
      "/auth": backendUrl,
    },
  },
});
