import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: '/',
        name: 'Ruang Baca — Perpustakaan Pribadi',
        short_name: 'Ruang Baca',
        description: 'Perpustakaan pribadi Arkan Nafi Nurcahyo.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f7f7f2',
        theme_color: '#355b45',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
