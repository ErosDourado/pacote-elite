// ─────────────────────────────────────────────────────────────────
//  productsService.js — CRUD da coleção `products` (loja)
//
//  Documento `products/{id}`:
//    {
//      name:        string,
//      description: string,
//      price:       number,
//      category:    string,
//      imageUrl:    string,
//      inStock:     boolean,
//      stockQty:    number,
//      order:       number,
//      createdAt:   Timestamp,
//      updatedAt:   Timestamp,
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

const COLLECTION = 'products'
const colRef = db ? collection(db, COLLECTION) : null

/** Cria novo produto. */
export async function createProduct(data) {
  const payload = {
    name:        '',
    description: '',
    price:       0,
    category:    'Outros',
    imageUrl:    '',
    inStock:     true,
    stockQty:    0,
    order:       Date.now(),
    ...data,
    createdAt:   serverTimestamp(),
    updatedAt:   serverTimestamp(),
  }
  const ref = await addDoc(colRef, payload)
  return ref.id
}

/** Lista todos (one-shot). */
export async function listProducts() {
  const q = query(colRef, orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

/** Subscribe em tempo real. */
export function subscribeProducts(onData, onError) {
  const q = query(colRef, orderBy('order', 'asc'))
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => {
      console.error('[productsService] subscribe error:', err)
      onError?.(err)
    }
  )
}

/** Lê um produto. */
export async function getProduct(id) {
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

/** Atualiza campos. */
export async function updateProduct(id, patch) {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() })
}

/** Helper: alternar disponibilidade. */
export async function toggleProductStock(id, currentInStock) {
  await updateProduct(id, { inStock: !currentInStock })
}

/** Remove produto. */
export async function deleteProduct(id) {
  const ref = doc(db, COLLECTION, id)
  await deleteDoc(ref)
}
