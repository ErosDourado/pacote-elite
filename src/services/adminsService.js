// ─────────────────────────────────────────────────────────────────
//  adminsService.js — Coleção `admins` no Firestore
//
//  Modelo simples:
//    • Cada documento tem o EMAIL como ID
//    • Ter o documento = ser admin
//    • Para tornar alguém admin: criar `admins/{email}` no console
//
//  Estrutura do documento `admins/{email}`:
//    {
//      role:    'admin'       (livre, só pra ter algum dado)
//      addedAt: Timestamp     (opcional)
//    }
// ─────────────────────────────────────────────────────────────────

import { doc, getDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'admins'

/** Verifica se o email é admin (consulta única). */
export async function isAdminEmail(email) {
  if (!email) return false
  try {
    const ref = doc(db, COLLECTION, email.toLowerCase().trim())
    const snap = await getDoc(ref)
    return snap.exists()
  } catch (err) {
    console.error('[adminsService] isAdminEmail error:', err)
    return false
  }
}

/** Subscribe à entrada do email — útil pra refletir em tempo real
 *  quando o status admin muda (raro, mas previne ter que recarregar).
 *  Retorna unsubscribe. */
export function subscribeAdminStatus(email, onChange) {
  if (!email) {
    onChange(false)
    return () => {}
  }
  const ref = doc(db, COLLECTION, email.toLowerCase().trim())
  return onSnapshot(
    ref,
    snap => onChange(snap.exists()),
    err => {
      console.warn('[adminsService] subscribe error:', err)
      onChange(false)
    }
  )
}

/** Promove um email a admin (só funciona se quem chama já é admin —
 *  as regras do Firestore vão impedir outros casos). */
export async function addAdmin(email) {
  const ref = doc(db, COLLECTION, email.toLowerCase().trim())
  await setDoc(ref, { role: 'admin', addedAt: serverTimestamp() })
}

/** Remove privilégio admin de um email. */
export async function removeAdmin(email) {
  const ref = doc(db, COLLECTION, email.toLowerCase().trim())
  await deleteDoc(ref)
}
