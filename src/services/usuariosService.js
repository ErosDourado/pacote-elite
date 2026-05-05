import {
  collection, doc,
  setDoc, query, orderBy, onSnapshot,
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

/** Subscribe em tempo real na coleção de usuários. */
export function subscribeUsuarios(onData, onError) {
  if (!colRef) { onData([]); return () => {} }
  const q = query(colRef, orderBy('name', 'asc'))
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => {
      console.error('[usuariosService] subscribe error:', err)
      onError?.(err)
    }
  )
}
