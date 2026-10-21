/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // github pages
  base: '/overlog/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Overlog',
        short_name: 'Overlog',
        description: 'Anote cargas e repetições, monte treinos e veja como fazer cada exercício.',
        lang: 'pt-BR',
        theme_color: '#0c0c0c',
        background_color: '#0c0c0c',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['health', 'fitness', 'sports'],
        // same app even if the start page changes later
        id: '/overlog/',
        scope: '.',
        start_url: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            // gym has bad signal
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/everkinetic\/data\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-drawings',
              expiration: { maxEntries: 2000, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  // exercises.json chunk
  build: { chunkSizeWarningLimit: 1000 },
  test: {
    environment: 'node',
  },
});
