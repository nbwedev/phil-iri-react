import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.svg", "icon-512.svg"],
      manifest: {
        name: "Phil-IRI Assessment Tool",
        short_name: "Phil-IRI",
        description: "DepEd Phil-IRI 2018 Reading Assessment Tool",
        theme_color: "#1e40af",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait-primary",
        icons: [
          {
            src: "icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Cache all app files so it works offline
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2}"],
        // Don't require network for navigation — serve from cache
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: {
        // Lets you test PWA behaviour in dev mode with `npm run dev`
        enabled: false,
      },
    }),
  ],
});
