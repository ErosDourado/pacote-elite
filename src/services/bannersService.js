// ─────────────────────────────────────────────────────────────────
//  bannersService.js — CRUD da coleção `banners`
//
//  Documento `banners/{id}`:
//    {
//      url:       string,    // URL da imagem
//      title:     string,
//      subtitle:  string,
//      ctaLabel:  string,    // texto do botão (vazio = sem botão)
//      ctaType:   'scheduling' | 'service' | 'product',
//      ctaTarget: string,    // id do serviço/produto (se aplicável)
//      vipOnly:   boolean,
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

const COLLECTION = 'banners'
const colRef = collection(db, COLLECTION)

export async function createBanner(data) {
  const payload = {
    url:       '',
    title:     '',
    subtitle:  '',
    ctaLabel:  '',
    ctaType:   'scheduling',
    ctaTarget: '',
    vipOnly:   false,
    order:     Date.now(),
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const ref = await addDoc(colRef, payload)
  return ref.id
}

export async function listBanners() {
  const q = query(colRef, orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export function subscribeBanners(onData, onError) {
  const q = query(colRef, orderBy('order', 'asc'))
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => {
      console.error('[bannersService] subscribe error:', err)
      onError?.(err)
    }
  )
}

export async function getBanner(id) {
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateBanner(id, patch) {
  const ref = doc(db, COLLECTION, id)
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteBanner(id) {
  const ref = doc(db, COLLECTION, id)
  await deleteDoc(ref)
}
