import crypto from "node:crypto";
import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

function pwaVersionMetadataPlugin({ buildId, builtAt }) {
  const versionPayload = JSON.stringify(
    {
      buildId,
      builtAt,
    },
    null,
    2,
  );

  return {
    name: "pwa-version-metadata",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split("?")[0] : "";
        if (url === "/version.json") {
          res.setHeader("Content-Type", "application/json");
          res.end(versionPayload);
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: versionPayload,
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const projectId = env.VITE_FIREBASE_PROJECT_ID || "test-data-895e2";

  const buildId =
    env.VITE_BUILD_ID ||
    process.env.VITE_BUILD_ID ||
    (command === "build"
      ? `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
      : "development");
  const builtAt = new Date().toISOString();

  return {
    server: {
      host: "localhost",
      port: Number.parseInt(process.env.npm_config_port || "4445", 10),
      strictPort: true,
      allowedHosts: [".trycloudflare.com"],
      headers: { "Cache-Control": "no-store" },
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
      __APP_BUILD_ID__: JSON.stringify(buildId),
      __APP_BUILT_AT__: JSON.stringify(builtAt),
      "process.env": process.env,
    },
    plugins: [
      process.env.ANALYZE === "true" &&
        visualizer({ open: true, filename: "stats.html", gzipSize: true }),
      react(),
      pwaVersionMetadataPlugin({ buildId, builtAt }),
      VitePWA({
        injectRegister: null,
        workbox: {
          clientsClaim: true,
          maximumFileSizeToCacheInBytes: 10000000, // Set to 10MB to accommodate large bundles
          // OAuth callbacks and API requests must always reach the Function.
          navigateFallbackDenylist: [
            /^\/api(?:\/|$)/,
            /^\/version\.json$/,
            /^\/firebase-messaging-sw\.js$/,
          ],
          globIgnores: ["**/version.json"],
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
        registerType: "prompt",
        devOptions: {
          enabled: false,
        },
      }),
    ],
    base: "/",
  };
});
