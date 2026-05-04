import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../firebase'

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY

let _messaging = null
async function messaging() {
  if (_messaging) return _messaging
  const ok = await isSupported().catch(() => false)
  if (!ok || !app) throw new Error('unsupported')
  _messaging = getMessaging(app)
  return _messaging
}

function fns() {
  return getFunctions(app, 'us-central1')
}

/** Pede permissão, gera token FCM e salva no Firestore. Retorna o token ou null. */
export async function requestPushPermission() {
  if (!app) return null
  try {
    const m = await messaging()
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return null
    const token = await getToken(m, { vapidKey: VAPID_KEY })
    if (!token) return null
    await httpsCallable(fns(), 'saveOwnerToken')({ token })
    return token
  } catch (e) {
    console.warn('[Push] requestPushPermission:', e?.message)
    return null
  }
}

/** Remove token do Firestore (desativa notificações). */
export async function disablePush(token) {
  if (!token || !app) return
  try { await httpsCallable(fns(), 'removeOwnerToken')({ token }) } catch {}
}

/** Envia notificação para a proprietária via Cloud Function. Fire-and-forget. */
export function notifyOwner(title, body) {
  if (!app) return Promise.resolve()
  return httpsCallable(fns(), 'notifyOwner')({ title, body }).catch(() => {})
}

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window

export const getPushPermission = () =>
  typeof Notification !== 'undefined' ? Notification.permission : 'default'
