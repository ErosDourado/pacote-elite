// ─────────────────────────────────────────────────────────────────
//  clientsSearchService.js — Busca unificada
//
//  Combina duas fontes:
//    • users    → usuários cadastrados via login do app
//    • clientes → cadastrados manualmente pelo admin
//
//  Retorna uma lista normalizada para auto-preenchimento de
//  agendamento. Cada item tem `source`, `id`, `name`, `phone`,
//  `email`, `userId`, `clientId` para vincular corretamente.
//
//  Estratégia: faz `getDocs` das duas coleções, mantém em memória,
//  filtra localmente por nome/telefone (case-insensitive). Para
//  bases > 1000 docs, considere migrar para Algolia ou Cloud
//  Functions com índice.
// ─────────────────────────────────────────────────────────────────

import { collection, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

/** Normaliza um doc de users ou clientes pro mesmo formato. */
function normalize(docSnap, source) {
  const data = docSnap.data()
  const item = {
    id:         docSnap.id,
    source,                                // 'users' | 'clientes'
    name:       data.name || data.displayName || '',
    phone:      (data.phone || '').replace(/\D/g, ''),
    email:      data.email || '',
    isVip:      !!data.isVip,
    userId:     source === 'users'    ? docSnap.id : '',
    clientId:   source === 'clientes' ? docSnap.id : '',
  }
  return item
}

/** Carrega tudo uma vez (one-shot). */
export async function loadAllClients() {
  const [usersSnap, clientesSnap] = await Promise.all([
    getDocs(collection(db, 'users')).catch(() => ({ docs: [] })),
    getDocs(collection(db, 'clientes')).catch(() => ({ docs: [] })),
  ])
  const users    = usersSnap.docs.map(d => normalize(d, 'users'))
  const clientes = clientesSnap.docs.map(d => normalize(d, 'clientes'))

  // Deduplica por telefone (preferindo users.uid quando coincide)
  const byPhone = new Map()
  ;[...users, ...clientes].forEach(c => {
    if (!c.phone) {
      byPhone.set(c.id, c)
      return
    }
    const existing = byPhone.get(c.phone)
    if (!existing || existing.source === 'clientes') {
      byPhone.set(c.phone, c)
    }
  })
  return Array.from(byPhone.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

/** Subscribe em tempo real às DUAS coleções.
 *  Retorna função de unsubscribe (cancela ambas). */
export function subscribeAllClients(onData, onError) {
  let usersList = []
  let clientesList = []

  const emit = () => {
    const byPhone = new Map()
    ;[...usersList, ...clientesList].forEach(c => {
      if (!c.phone) { byPhone.set(c.id, c); return }
      const existing = byPhone.get(c.phone)
      if (!existing || existing.source === 'clientes') byPhone.set(c.phone, c)
    })
    onData(Array.from(byPhone.values()).sort((a, b) => (a.name || '').localeCompare(b.name || '')))
  }

  const unsubU = onSnapshot(collection(db, 'users'),
    snap => { usersList = snap.docs.map(d => normalize(d, 'users')); emit() },
    err => { console.warn('[clientsSearch] users error:', err); onError?.(err) }
  )
  const unsubC = onSnapshot(collection(db, 'clientes'),
    snap => { clientesList = snap.docs.map(d => normalize(d, 'clientes')); emit() },
    err => { console.warn('[clientsSearch] clientes error:', err); onError?.(err) }
  )

  return () => { unsubU(); unsubC() }
}

/** Filtra a lista por nome ou telefone (case-insensitive). */
export function filterClients(clients, queryStr) {
  const q = (queryStr || '').toLowerCase().trim()
  if (!q) return clients
  const qDigits = q.replace(/\D/g, '')
  return clients.filter(c => {
    if ((c.name || '').toLowerCase().includes(q)) return true
    if (qDigits && c.phone && c.phone.includes(qDigits)) return true
    if ((c.email || '').toLowerCase().includes(q)) return true
    return false
  })
}
