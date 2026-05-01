// ─────────────────────────────────────────────────────────────────
//  proceduresService.js — CRUD da coleção `procedures`
//  (carrossel "Nossos Procedimentos" da Home)
//
//  Documento `procedures/{id}`:
//    {
//      titulo:    string,
//      imagem:    string,    // URL da imagem
//      descricao: string,
//      order:     number,
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

const COLLECTION = 'procedures'
const colRef = collection(db, COLLECTION)

export async function createProcedure(data) {
  const payload = {
    titulo:    '',
    imagem:    '',
    descricao: '',
    order:     Date.now(),
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const ref = await addDoc(colRef, payload)
  return ref.id
}

export async function listProcedures() {
  const q = query(colRef, orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribeProcedures(onData, onError) {
  const q = query(colRef, orderBy('order', 'asc'))
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => {
      console.error('[proceduresService] subscribe error:', err)
      onError?.(err)
    }
  )
}

export async function getProcedure(id) {
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateProcedure(id, patch) {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteProcedure(id) {
  const ref = doc(db, COLLECTION, id)
  await deleteDoc(ref)
}
