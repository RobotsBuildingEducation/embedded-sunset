import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const projectId = env.VITE_FIREBASE_PROJECT_ID || "test-data-895e2";

  return {
    server: {
      host: "localhost",
      port: Number.parseInt(process.env.npm_config_port || "4445", 10),
      strictPort: true,
      allowedHosts: [".trycloudflare.com"],
      proxy: {
        // Firestore's persistent WebChannel stream, forwarded to the local emulator.
        "/google.firestore.v1.Firestore": {
          target: "http://127.0.0.1:8080",
          changeOrigin: true,
        },
        "/api/chess": {
          target: "http://127.0.0.1:5001",
          changeOrigin: true,
          rewrite: (path) => `/${projectId}/us-central1/chessApi${path}`,
        },
        "/api/patreon": {
          target: "http://127.0.0.1:5001",
          changeOrigin: true,
          rewrite: (path) => `/${projectId}/us-central1/patreonAuth${path}`,
        },
      },
    },
    define: {
      "process.env": process.env,
    },
    plugins: [
      process.env.ANALYZE === "true" &&
        visualizer({ open: true, filename: "stats.html", gzipSize: true }),
      react(),
      VitePWA({
        workbox: {
          maximumFileSizeToCacheInBytes: 10000000, // Set to 10MB to accommodate large bundles
          // OAuth callbacks and API requests must always reach the Function.
          navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        },
        manifest: {
          name: "Robots Building Education",
          short_name: "Robots Building Education",
          start_url: "./",
          display: "standalone",

          theme_color: "#FDDEE6",
          background_color: "#ffffff",

          description: "Robots Building Education",

          icons: [
            {
              src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1790678646/logos_512_x_512_px_16_y8ff9z.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1790678646/logos_512_x_512_px_16_y8ff9z.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        registerType: "autoUpdate",
        devOptions: {
          enabled: true,
        },
      }),
    ],
    base: "/",
  };
});
