import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: parseInt(process.env.npm_config_port),
  },
  plugins: [
    react(),
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000, // Set to 4MB or any higher value
      },
      manifest: {
        name: "Robots Building Education",
        short_name: "Robots Building Education",
        start_url: "./",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#ffffff",
        description:
          "PWA install handler package for Robots Building Education",
        icons: [
          {
            src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1728270558/zre4dehmebfdikzeasoh.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1728270558/zre4dehmebfdikzeasoh.png",
            sizes: "256x256",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "https://res.cloudinary.com/dtkeyccga/image/upload/v1728270558/zre4dehmebfdikzeasoh.png",
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
