import {
  collection, doc,
  addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'gallery'
const colRef = db ? collection(db, COLLECTION) : null

export async function createGalleryPhoto(data) {
  if (!colRef) return null
  const payload = {
    url: '',
    objectPosition: '50% 50%',
    order: Date.now(),
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  const ref = await addDoc(colRef, payload)
  return ref.id
}

export function subscribeGallery(onData, onError) {
  if (!colRef) return () => {}
  const q = query(colRef, orderBy('order', 'asc'))
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => {
      console.error('[galleryService] subscribe error:', err)
      onError?.(err)
    }
  )
}

export async function updateGalleryPhoto(id, patch) {
  if (!db) return
  await updateDoc(doc(db, COLLECTION, id), { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteGalleryPhoto(id) {
  if (!db) return
  await deleteDoc(doc(db, COLLECTION, id))
}
