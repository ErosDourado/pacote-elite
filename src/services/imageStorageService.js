import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'

/** Faz upload de uma imagem base64 para o Firebase Storage.
 *  Retorna a URL pública de download. */
export async function uploadImage(base64DataUrl, folder = 'media') {
  if (!storage) throw new Error('Storage não configurado')
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
  const storageRef = ref(storage, path)
  await uploadString(storageRef, base64DataUrl, 'data_url')
  return getDownloadURL(storageRef)
}

/** Remove imagem do Storage a partir da URL de download. */
export async function deleteImage(downloadUrl) {
  if (!storage || !downloadUrl) return
  try {
    const path = decodeURIComponent(downloadUrl.split('/o/')[1]?.split('?')[0] ?? '')
    if (!path) return
    await deleteObject(ref(storage, path))
  } catch {}
}
