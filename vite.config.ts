import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    proxy: {
      // http://localhost:5173/api -> http://localhost:3000/api
      "/api": "http://localhost:3000",
      "/auth": "http://localhost:3000",
    },
  },
});
