// ─────────────────────────────────────────────────────────────────
//  clientesService.js — CRUD da coleção `clientes`
//  (clientes cadastrados manualmente pelo admin, sem login)
//
//  Documento `clientes/{id}`:
//    {
//      name:      string,
//      phone:     string,    // só dígitos, com DDD
//      email:     string,
//      isVip:     boolean,
//      notes:     string,    // observações internas do admin
//      createdAt: Timestamp,
//      updatedAt: Timestamp,
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

const COLLECTION = 'clientes'
const colRef = collection(db, COLLECTION)

export async function createCliente(data) {
  const payload = {
    name:      '',
    phone:     '',
    email:     '',
    isVip:     false,
    notes:     '',
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const ref = await addDoc(colRef, payload)
  return ref.id
}

export async function listClientes() {
  const q = query(colRef, orderBy('name', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribeClientes(onData, onError) {
  const q = query(colRef, orderBy('name', 'asc'))
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => {
      console.error('[clientesService] subscribe error:', err)
      onError?.(err)
    }
  )
}

export async function getCliente(id) {
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateCliente(id, patch) {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() })
}

/** Helper: alternar VIP. */
export async function toggleClienteVip(id, currentVip) {
  await updateCliente(id, { isVip: !currentVip })
}

/** Remove cliente. */
export async function deleteCliente(id) {
  await deleteDoc(doc(db, COLLECTION, id))
}
