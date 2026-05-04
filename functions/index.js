const { onCall } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { getMessaging } = require('firebase-admin/messaging')

initializeApp()
const db = getFirestore()
const msg = getMessaging()

// Salva token FCM do dispositivo da proprietária
exports.saveOwnerToken = onCall(async (req) => {
  const { token } = req.data
  if (!token) return { ok: false }
  await db.doc(`ownerTokens/${token}`).set({ createdAt: FieldValue.serverTimestamp() })
  return { ok: true }
})

// Remove token (proprietária desativou notificações)
exports.removeOwnerToken = onCall(async (req) => {
  const { token } = req.data
  if (!token) return { ok: false }
  await db.doc(`ownerTokens/${token}`).delete()
  return { ok: true }
})

// Envia notificação para todos os dispositivos da proprietária
exports.notifyOwner = onCall(async (req) => {
  const { title, body } = req.data
  if (!title) return { ok: false }

  const snap = await db.collection('ownerTokens').get()
  const tokens = snap.docs.map(d => d.id).filter(Boolean)
  if (!tokens.length) return { ok: false, reason: 'no_tokens' }

  const result = await msg.sendEachForMulticast({
    tokens,
    notification: { title, body: body || '' },
    webpush: {
      notification: { icon: '/pwa-192x192.png', badge: '/pwa-64x64.png' },
      fcmOptions: { link: '/' },
    },
    apns: {
      payload: { aps: { sound: 'default', badge: 1 } },
    },
  })

  // Limpa tokens inválidos
  const toDelete = result.responses
    .map((r, i) => (!r.success ? tokens[i] : null))
    .filter(Boolean)
  await Promise.all(toDelete.map(t => db.doc(`ownerTokens/${t}`).delete()))

  return { ok: true, sent: result.successCount, failed: result.failureCount }
})
