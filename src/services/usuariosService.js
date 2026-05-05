import {
  collection, doc,
  setDoc, onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'usuarios'
const colRef = db ? collection(db, COLLECTION) : null

/** Salva/atualiza um usuário usando o telefone como ID do documento. */
export async function upsertUsuario(data) {
  if (!colRef || !db) return
  const phone = (data.phone || '').replace(/\D/g, '')
  if (!phone) return
  const ref = doc(db, COLLECTION, phone)
  await setDoc(ref, {
    name:      data.name  || '',
    phone,
    email:     data.email || '',
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/** Atualiza apenas o campo isVip de um usuário. */
export async function updateUsuarioVip(phone, isVip) {
  if (!db) return
  const normalizedPhone = (phone || '').replace(/\D/g, '')
  if (!normalizedPhone) return
  const ref = doc(db, COLLECTION, normalizedPhone)
  await setDoc(ref, { isVip, updatedAt: serverTimestamp() }, { merge: true })
}

/** Subscribe em tempo real na coleção de usuários. */
export function subscribeUsuarios(onData, onError) {
  if (!colRef) { onData([]); return () => {} }
  // Sem orderBy para não depender de índice composto
  return onSnapshot(
    colRef,
    snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'))
      onData(docs)
    },
    err => {
      console.error('[usuariosService] subscribe error:', err)
      onError?.(err)
    }
  )
}
