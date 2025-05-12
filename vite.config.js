import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/seif-budget-planner/',
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        runtimeCaching: [
          // {
          //   urlPattern: /^https:\/\/api\.example\.com\/.*/,
          //   handler: 'NetworkFirst',
          //   options: {
          //     cacheName: 'api-cache',
          //     expiration: {
          //       maxEntries: 10,
          //       maxAgeSeconds: 60 * 60 * 24 // 1 day
          //     },
          //     cacheableResponse: { statuses: [0, 200] }
          //   }
          // }
        ]
      },
      manifest: {
        name: 'Seif Budget Planner',
        short_name: 'BudgetApp',
        description: 'Personal budget planning application',
        theme_color: '#1A1A1A',
        background_color: '#2C2C2C',
        display: 'standalone',
        scope: '/seif-budget-planner/',
        start_url: '/seif-budget-planner/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
})
