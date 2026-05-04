// ─────────────────────────────────────────────────────────────────
//  appointmentsService.js — CRUD da coleção `appointments`
//
//  Documento `appointments/{id}`:
//    {
//      clientName:    string,
//      clientPhone:   string,
//      clientEmail:   string,
//      service:       { id, name, price, duration, ... },
//      date:          string ('YYYY-MM-DD'),
//      time:          string ('HH:MM'),
//      status:        'pending' | 'confirmed' | 'completed' | 'cancelled',
//      paymentStatus: 'pending' | 'paid' | 'refunded',
//      createdAt:     Timestamp,
//      updatedAt:     Timestamp,
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

const COLLECTION = 'appointments'
const colRef = db ? collection(db, COLLECTION) : null

/** Verifica se um horário está disponível.
 *  Considera ocupado se houver agendamento em date+time com status
 *  diferente de 'cancelled'. Retorna true se está livre.
 */
export async function checkSlotAvailable(date, time) {
  if (!date || !time) return false
  const q = query(colRef, where('date', '==', date), where('time', '==', time))
  const snap = await getDocs(q)
  // Disponível se TODOS os matches estão cancelados
  const taken = snap.docs.some(d => d.data().status !== 'cancelled')
  return !taken
}

/** Cria agendamento COM verificação de horário ocupado.
 *  Lança erro se o slot estiver ocupado.
 *  Use no lugar de createAppointment quando quiser validação.
 */
export async function createAppointmentSafe(data) {
  const free = await checkSlotAvailable(data.date, data.time)
  if (!free) {
    const err = new Error('Oops! Este horário já está ocupado. Por favor, escolha outro.')
    err.code = 'slot/taken'
    throw err
  }
  return createAppointment(data)
}

/** Cria um novo agendamento. Status default: 'pending'. */
export async function createAppointment(data) {
  const payload = {
    clientName:    '',
    clientPhone:   '',
    clientEmail:   '',
    service:       null,
    date:          '',
    time:          '',
    status:        'pending',
    paymentStatus: 'pending',
    ...data,
    createdAt:     serverTimestamp(),
    updatedAt:     serverTimestamp(),
  }
  const ref = await addDoc(colRef, payload)
  return ref.id
}

/** Lê todos os agendamentos ordenados por data (decrescente). */
export async function listAppointments() {
  const q = query(colRef, orderBy('date', 'desc'), orderBy('time', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/** Subscribe em tempo real — todos os agendamentos. */
export function subscribeAppointments(onData, onError) {
  const q = query(colRef, orderBy('date', 'desc'), orderBy('time', 'asc'))
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => {
      console.error('[appointmentsService] subscribe error:', err)
      onError?.(err)
    }
  )
}

/** Subscribe filtrado por data ('YYYY-MM-DD'). Útil pra view do dia. */
export function subscribeAppointmentsByDate(dateStr, onData, onError) {
  const q = query(colRef, where('date', '==', dateStr), orderBy('time', 'asc'))
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => {
      console.error('[appointmentsService] subscribeByDate error:', err)
      onError?.(err)
    }
  )
}

/** Lê um agendamento específico. */
export async function getAppointment(id) {
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/** Atualiza campos parciais. */
export async function updateAppointment(id, patch) {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() })
}

/** Helper específico: muda status (com paymentStatus correlacionado). */
export async function updateAppointmentStatus(id, status) {
  const payMap = { completed: 'paid', cancelled: 'refunded', confirmed: 'pending', pending: 'pending' }
  await updateAppointment(id, { status, paymentStatus: payMap[status] ?? 'pending' })
}

/** Remove um agendamento. */
export async function deleteAppointment(id) {
  const ref = doc(db, COLLECTION, id)
  await deleteDoc(ref)
}
