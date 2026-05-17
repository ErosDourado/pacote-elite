import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { writeFileSync, mkdirSync } from 'fs'

function firebaseSwPlugin(env) {
  return {
    name: 'firebase-messaging-sw',
    closeBundle() {
      const cfg = {
        apiKey:            env.VITE_FIREBASE_API_KEY            ?? '',
        authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN        ?? '',
        projectId:         env.VITE_FIREBASE_PROJECT_ID         ?? '',
        storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET     ?? '',
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
        appId:             env.VITE_FIREBASE_APP_ID             ?? '',
      }
      const sw = `importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')
firebase.initializeApp(${JSON.stringify(cfg)})
const messaging = firebase.messaging()
// Lê do payload.data (Cloud Function envia data-only para evitar duplicata).
messaging.onBackgroundMessage(payload => {
  const d = payload.data || {}
  self.registration.showNotification(d.title || 'Studio', {
    body: d.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-64x64.png',
    tag:  'studio-' + Date.now(),
    requireInteraction: false,
    silent: false,
  })
})
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus() }
      if (clients.openWindow) return clients.openWindow('/')
    })
  )
})
`
      try { mkdirSync('dist', { recursive: true }) } catch {}
      try { writeFileSync('dist/firebase-messaging-sw.js', sw) } catch {}
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/icon.svg'],
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'unsplash-images', expiration: { maxEntries: 50, maxAgeSeconds: 60*60*24*30 } },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'google-fonts-stylesheets' },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'google-fonts-webfonts', expiration: { maxEntries: 20, maxAgeSeconds: 60*60*24*365 } },
            },
          ],
        },
      }),
      firebaseSwPlugin(env),
    ],
  }
})
