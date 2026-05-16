import {
  collection, doc,
  setDoc, onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'usuarios'
const colRef = db ? collection(db, COLLECTION) : null

/** Salva/atualiza um usuário. Cria docs tanto pelo phone quanto pelo email se ambos existirem.
 *  Importante: NÃO sobrescreve campos com string vazia — só persiste valores que existem,
 *  pra não apagar email/phone/name previamente salvos. */
export async function upsertUsuario(data) {
  if (!colRef || !db) return
  const phone = (data.phone || '').replace(/\D/g, '')
  const email = (data.email || '').trim().toLowerCase()
  const name  = (data.name || '').trim()
  if (!phone && !email) return

  const writes = []
  if (phone) {
    const payload = { updatedAt: serverTimestamp(), phone }
    if (name)  payload.name  = name
    if (email) payload.email = email
    writes.push(setDoc(doc(db, COLLECTION, phone), payload, { merge: true }))
  }
  if (email) {
    const payload = { updatedAt: serverTimestamp(), email }
    if (name)  payload.name  = name
    if (phone) payload.phone = phone
    writes.push(setDoc(doc(db, COLLECTION, email), payload, { merge: true }))
  }
  try { await Promise.all(writes) }
  catch (e) { console.error('[upsertUsuario]', e) }
}

/** Atualiza isVip de um usuário pelo email (quando não tem telefone). */
export async function updateUsuarioVipByEmail(email, isVip) {
  if (!db || !email) return
  const id = email.trim().toLowerCase()
  const ref = doc(db, COLLECTION, id)
  await setDoc(ref, { email: id, isVip, updatedAt: serverTimestamp() }, { merge: true })
}

/** Atualiza isVip de um usuário, preservando email se fornecido. */
export async function updateUsuarioVip(phone, isVip, email = '') {
  if (!db) return
  const normalizedPhone = (phone || '').replace(/\D/g, '')
  if (!normalizedPhone) return
  const normalizedEmail = (email || '').trim().toLowerCase()
  const ref = doc(db, COLLECTION, normalizedPhone)
  const payload = { phone: normalizedPhone, isVip, updatedAt: serverTimestamp() }
  if (normalizedEmail) payload.email = normalizedEmail
  await setDoc(ref, payload, { merge: true })

  // Espelha o status VIP no doc email-keyed, se houver email — assim amIVip
  // funciona tanto via match por phone quanto via match por email.
  if (normalizedEmail) {
    const emailRef = doc(db, COLLECTION, normalizedEmail)
    await setDoc(emailRef, { email: normalizedEmail, phone: normalizedPhone, isVip, updatedAt: serverTimestamp() }, { merge: true })
  }
}

/** Subscribe em tempo real na coleção de usuários. */
export function subscribeUsuarios(onData, onError) {
  if (!colRef) { onData([]); return () => {} }
  // Sem orderBy para não depender de índice composto
  return onSnapshot(
    colRef,
    snap => {
      const docs = snap.docs.map(d => {
        const isEmailId = d.id.includes('@')
        const data = d.data()
        const rawEmail = isEmailId ? d.id : (data.email || '')
        return {
          ...data,
          // Se o ID do doc é email, phone vem do campo data (pode ser vazio)
          // Se o ID é telefone (dígitos), phone = d.id garante que sempre existe
          phone: isEmailId ? (data.phone || '') : d.id,
          email: (rawEmail || '').trim().toLowerCase(),
        }
      })
      docs.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'))
      onData(docs)
    },
    err => {
      console.error('[usuariosService] subscribe error:', err)
      onError?.(err)
    }
  )
}
