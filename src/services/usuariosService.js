import {
  collection, doc,
  setDoc, onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'usuarios'
const colRef = db ? collection(db, COLLECTION) : null

/** Salva/atualiza um usuário. Usa telefone como ID; se não tiver, usa email. */
export async function upsertUsuario(data) {
  if (!colRef || !db) return
  const phone = (data.phone || '').replace(/\D/g, '')
  const email = (data.email || '').trim()
  const docId = phone || email
  if (!docId) return
  const ref = doc(db, COLLECTION, docId)
  const payload = { name: data.name || '', email, updatedAt: serverTimestamp() }
  if (phone) payload.phone = phone
  await setDoc(ref, payload, { merge: true })
}

/** Atualiza isVip de um usuário, preservando email se fornecido. */
export async function updateUsuarioVip(phone, isVip, email = '') {
  if (!db) return
  const normalizedPhone = (phone || '').replace(/\D/g, '')
  if (!normalizedPhone) return
  const ref = doc(db, COLLECTION, normalizedPhone)
  const payload = { phone: normalizedPhone, isVip, updatedAt: serverTimestamp() }
  if (email) payload.email = email
  await setDoc(ref, payload, { merge: true })
}

/** Subscribe em tempo real na coleção de usuários. */
export function subscribeUsuarios(onData, onError) {
  if (!colRef) { onData([]); return () => {} }
  // Sem orderBy para não depender de índice composto
  return onSnapshot(
    colRef,
    snap => {
      // phone: d.id garante que o campo phone sempre existe (ID do doc = telefone normalizado)
      const docs = snap.docs.map(d => ({ phone: d.id, ...d.data() }))
      docs.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'))
      onData(docs)
    },
    err => {
      console.error('[usuariosService] subscribe error:', err)
      onError?.(err)
    }
  )
}
