// ─────────────────────────────────────────────────────────────────
//  servicesService.js — CRUD da coleção `servicos` no Firestore
//
//  Funções prontas para conectar nos botões do painel admin:
//    createService(data)        → adiciona novo serviço
//    listServices()             → lê todos os serviços (one-shot)
//    subscribeServices(cb)      → escuta mudanças em tempo real
//    getService(id)             → lê um serviço específico
//    updateService(id, patch)   → atualiza campos
//    deleteService(id)          → remove serviço
//
//  Schema sugerido do documento `servicos/{id}`:
//    {
//      name:        string,
//      category:    string,
//      price:       number,
//      duration:    number,    // minutos
//      description: string,
//      icon:        string,    // chave do ServiceIcons.jsx
//      active:      boolean,   // visível para clientes
//      order:       number,    // ordenação no app
//      createdAt:   Timestamp, // serverTimestamp()
//      updatedAt:   Timestamp, // serverTimestamp()
//    }
// ─────────────────────────────────────────────────────────────────

import {
  collection, doc,
  addDoc, getDoc, getDocs,
  updateDoc, deleteDoc,
  query, orderBy, onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// Nome da coleção centralizado para facilitar manutenção
const COLLECTION = 'servicos'
const getColRef = () => collection(db, COLLECTION)

/** Cria um novo serviço. Retorna o ID gerado. */
export async function createService(data) {
  const payload = {
    name:        '',
    category:    '',
    price:       0,
    duration:    60,
    description: '',
    icon:        'Eyelash',
    active:      true,
    order:       Date.now(),
    ...data,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  }
  const ref = await addDoc(getColRef(), payload)
  return ref.id
}

/** Lê todos os serviços ordenados por `order`. One-shot. */
export async function listServices() {
  const q = query(getColRef(), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/** Subscribe em tempo real — retorna função de unsubscribe.
 *  @param onData  (items) => void   recebe a lista atualizada
 *  @param onError (err)   => void   opcional, recebe erros do Firestore
 */
export function subscribeServices(onData, onError) {
  const q = query(getColRef(), orderBy('order', 'asc'))
  return onSnapshot(
    q,
    snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      onData(items)
    },
    err => {
      console.error('[servicesService] subscribe error:', err)
      onError?.(err)
    }
  )
}

/** Lê um serviço específico. Retorna `null` se não existir. */
export async function getService(id) {
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/** Atualiza campos parciais. `updatedAt` é setado automaticamente. */
export async function updateService(id, patch) {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

/** Remove um serviço permanentemente. */
export async function deleteService(id) {
  const ref = doc(db, COLLECTION, id)
  await deleteDoc(ref)
}
