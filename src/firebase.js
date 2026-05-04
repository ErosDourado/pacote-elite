// ─────────────────────────────────────────────────────────────────
//  Firebase — inicialização modular V9+
//
//  As chaves são carregadas do `.env.local` via Vite (prefixo VITE_).
//  Singletons exportados: app, db, auth, storage.
//
//  Para clientes white-label: cada cliente tem seu próprio projeto
//  Firebase. Basta trocar o conteúdo do .env.local — nada no código
//  precisa mudar.
// ─────────────────────────────────────────────────────────────────

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Diagnóstico de chaves (ajuda a saber o que a Vercel está lendo)
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingKeys.length > 0 && import.meta.env.PROD) {
  console.error('[Firebase] Chaves ausentes no ambiente de Produção:', missingKeys.join(', '))
}

// Inicializa apenas uma vez (HMR-safe)
let app, db, auth, storage

try {
  if (missingKeys.length > 0) {
    throw new Error(`Configuração incompleta: ${missingKeys.join(', ')}`)
  }
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)
  storage = getStorage(app)
} catch (e) {
  console.error('[Firebase] Falha crítica:', e?.message)
  app = db = auth = storage = null
}

export { app, db, auth, storage }

// Helper de diagnóstico
export const isFirebaseConfigured = () => !!app && !!auth

export default app
