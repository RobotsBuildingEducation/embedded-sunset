import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
import prism from "vite-plugin-prismjs";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: parseInt(process.env.npm_config_port),
  },
  plugins: [
    visualizer({ open: true }),
    react(),
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 6100000, // Set to 4MB or any higher value
      },
      manifest: {
        name: "Robots Building Education",
        short_name: "Robots Building Education",
        start_url: "./",
        display: "standalone",
        theme_color: "#FDDEE6",
        background_color: "#ffffff",
        description:
          "PWA install handler package for Robots Building Education",
        icons: [
          {
            src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1743209424/FFFEF5_d4weow.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1743209424/FFFEF5_d4weow.png",
            sizes: "256x256",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1743209424/FFFEF5_d4weow.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
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
});
