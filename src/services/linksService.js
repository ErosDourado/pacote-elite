// ─────────────────────────────────────────────────────────────────
//  linksService.js — CRUD da coleção `links` (Linktree)
//
//  Documento `links/{id}`:
//    {
//      label:     string,    // texto exibido
//      url:       string,    // URL externa
//      icon:      string,    // chave do LINK_ICONS (Instagram, Music2, etc)
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

const COLLECTION = 'links'
const colRef = db ? collection(db, COLLECTION) : null

export async function createLink(data) {
  const payload = {
    label:     '',
    url:       '',
    icon:      'Globe',
    order:     Date.now(),
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const ref = await addDoc(colRef, payload)
  return ref.id
}

export async function listLinks() {
  const q = query(colRef, orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribeLinks(onData, onError) {
  const q = query(colRef, orderBy('order', 'asc'))
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => {
      console.error('[linksService] subscribe error:', err)
      onError?.(err)
    }
  )
}

export async function getLink(id) {
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateLink(id, patch) {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteLink(id) {
  const ref = doc(db, COLLECTION, id)
  await deleteDoc(ref)
}
