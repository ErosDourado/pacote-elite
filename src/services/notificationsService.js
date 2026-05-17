import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
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

/** Registra um listener pra mensagens recebidas com o app em foreground.
 *  Sem isso, FCM Web não exibe notificação enquanto o app está aberto.
 *  Retorna uma função de unsubscribe. */
export async function startForegroundListener() {
  if (!app) return () => {}
  try {
    const m = await messaging()
    return onMessage(m, payload => {
      const d = payload.data || {}
      const title = d.title || 'Studio'
      const body  = d.body  || ''
      const show = (reg) => {
        const opts = {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-64x64.png',
          tag:  'studio-' + Date.now(),
          silent: false,
        }
        if (reg) {
          reg.showNotification(title, opts)
        } else if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, opts)
        }
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
          .then(reg => show(reg || null))
          .catch(() => show(null))
      } else {
        show(null)
      }
    })
  } catch {
    return () => {}
  }
}

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window

export const getPushPermission = () =>
  typeof Notification !== 'undefined' ? Notification.permission : 'default'
