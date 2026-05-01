// Armazena imagens no IndexedDB — sem limite de quota, sobrevive a reloads
const DB  = 'studioMedia'
const STR = 'images'
let _db   = null

function open() {
  if (_db) return Promise.resolve(_db)
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = e => e.target.result.createObjectStore(STR)
    r.onsuccess = e => { _db = e.target.result; res(_db) }
    r.onerror   = () => rej(r.error)
  })
}

export async function idbPut(key, val) {
  try {
    const db = await open()
    await new Promise((res, rej) => {
      const tx = db.transaction(STR, 'readwrite')
      tx.objectStore(STR).put(val, key)
      tx.oncomplete = res
      tx.onerror    = () => rej(tx.error)
    })
  } catch { /* silently ignore */ }
}

export async function idbDel(key) {
  try {
    const db = await open()
    await new Promise(res => {
      const tx = db.transaction(STR, 'readwrite')
      tx.objectStore(STR).delete(key)
      tx.oncomplete = res
      tx.onerror    = res
    })
  } catch {}
}

export async function idbAll() {
  try {
    const db  = await open()
    const out = {}
    await new Promise(res => {
      const req = db.transaction(STR).objectStore(STR).openCursor()
      req.onsuccess = e => {
        const c = e.target.result
        if (c) { out[c.key] = c.value; c.continue() } else res()
      }
      req.onerror = res
    })
    return out
  } catch { return {} }
}
