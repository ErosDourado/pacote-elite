// ─────────────────────────────────────────────────────────────────
//  waitlistService.js — CRUD da coleção `fila_espera`
//
//  Documento `fila_espera/{id}`:
//    {
//      clientName:   string,
//      clientPhone:  string,
//      clientEmail:  string,
//      userId:       string,    // ref opcional ao users/{uid}
//      clientId:     string,    // ref opcional ao clientes/{id}
//      serviceId:    string,
//      serviceName:  string,
//      preferredDate: string,   // 'YYYY-MM-DD' que o cliente queria
//      preferredTime: string,   // 'HH:MM'
//      wantEarlier:  boolean,   // true se aceita qualquer vaga anterior
//      createdAt:    Timestamp,
//      notifiedAt:   Timestamp | null,  // quando foi notificado (controle)
//    }
// ─────────────────────────────────────────────────────────────────

import {
  collection, doc,
  addDoc, getDoc, getDocs,
  updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'fila_espera'
const colRef = db ? collection(db, COLLECTION) : null

/** Adiciona cliente à fila de espera. */
export async function createWaitlistEntry(data) {
  const payload = {
    clientName:    '',
    clientPhone:   '',
    clientEmail:   '',
    userId:        '',
    clientId:      '',
    serviceId:     '',
    serviceName:   '',
    preferredDate: '',
    preferredTime: '',
    wantEarlier:   false,
    notifiedAt:    null,
    ...data,
    createdAt:     serverTimestamp(),
  }
  const ref = await addDoc(colRef, payload)
  return ref.id
}

/** Lista todos os entries (one-shot). */
export async function listWaitlist() {
  const q = query(colRef, orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/** Subscribe em tempo real. */
export function subscribeWaitlist(onData, onError) {
  const q = query(colRef, orderBy('createdAt', 'asc'))
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => {
      console.error('[waitlistService] subscribe error:', err)
      onError?.(err)
    }
  )
}

/** Remove entry da fila. */
export async function deleteWaitlistEntry(id) {
  await deleteDoc(doc(db, COLLECTION, id))
}

/** Marca o cliente como notificado (não exclui). */
export async function markNotified(id) {
  await updateDoc(doc(db, COLLECTION, id), { notifiedAt: serverTimestamp() })
}

/** Busca candidatos para um horário liberado.
 *
 *  Critério:
 *  - Match exato em preferredDate + preferredTime, OU
 *  - wantEarlier === true E (preferredDate > releasedDate OU
 *    (preferredDate === releasedDate E preferredTime > releasedTime))
 *
 *  Filtra apenas entries não notificadas recentemente (não há filtro
 *  por serviceId — caso queira, é só passar serviceFilterId).
 */
export async function findCandidatesForSlot({ date, time, serviceId } = {}) {
  if (!date || !time) return []
  const all = await listWaitlist()
  return all.filter(entry => {
    if (entry.notifiedAt) return false
    if (serviceId && entry.serviceId && entry.serviceId !== serviceId) return false

    // Match exato
    if (entry.preferredDate === date && entry.preferredTime === time) return true

    // wantEarlier: cliente aceita vaga anterior à data preferida
    if (entry.wantEarlier && entry.preferredDate) {
      if (date < entry.preferredDate) return true
      if (date === entry.preferredDate && time < entry.preferredTime) return true
    }
    return false
  })
}
