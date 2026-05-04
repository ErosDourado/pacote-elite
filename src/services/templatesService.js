// ─────────────────────────────────────────────────────────────────
//  templatesService.js — Templates de mensagem do WhatsApp
//
//  Documento único: `content/messages`
//
//  Estrutura:
//    {
//      pending:   string,
//      confirmed: string,
//      concluded: string,
//      cancelled: string,
//      waitlist:  string,
//      updatedAt: Timestamp,
//    }
//
//  Variáveis aceitas nas mensagens:
//    {nome}     → nome do cliente
//    {servico}  → nome do serviço
//    {data}     → data formatada (ex: "29 de abril")
//    {hora}     → horário (HH:MM)
// ─────────────────────────────────────────────────────────────────

import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const DOC_REF = doc(db, 'content', 'messages')

// Defaults caso o documento ainda não exista no Firestore
export const DEFAULT_TEMPLATES = {
  pending:   'Olá {nome}, recebemos seu pedido de agendamento para {servico} no dia {data} às {hora}. Podemos confirmar?',
  confirmed: 'Olá {nome}! Confirmando seu agendamento de {servico} para {data} às {hora}. Te esperamos!',
  concluded: 'Olá {nome}! Esperamos que tenha gostado do seu atendimento de {servico}. Volte sempre!',
  cancelled: 'Olá {nome}, gostaríamos de confirmar o cancelamento do seu agendamento de {servico} no dia {data}.',
  waitlist:  'Olá {nome}! Abriu uma vaga para {servico} no dia {data} às {hora}. Tem interesse? Responde aqui pra confirmar.',
}

/** Lê os templates atuais. Retorna defaults se o doc não existir. */
export async function getTemplates() {
  const snap = await getDoc(DOC_REF)
  if (!snap.exists()) return { ...DEFAULT_TEMPLATES }
  return { ...DEFAULT_TEMPLATES, ...snap.data() }
}

/** Subscribe em tempo real. */
export function subscribeTemplates(onData, onError) {
  return onSnapshot(
    DOC_REF,
    snap => {
      const data = snap.exists() ? snap.data() : {}
      onData({ ...DEFAULT_TEMPLATES, ...data })
    },
    err => {
      console.error('[templatesService] subscribe error:', err)
      onError?.(err)
    }
  )
}

/** Atualiza uma chave (status). */
export async function updateTemplate(status, message) {
  await setDoc(
    DOC_REF,
    { [status]: message, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

/** Substitui todos os templates de uma vez. */
export async function setAllTemplates(templates) {
  await setDoc(
    DOC_REF,
    { ...templates, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

/** Substitui placeholders pela mensagem real. */
export function renderTemplate(template, appt) {
  const fmtDate = appt.date
    ? new Date(appt.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
    : ''
  return (template || '')
    .replace(/{nome}|{clientName}/gi,    appt.clientName || '')
    .replace(/{servico}|{service}/gi, appt.service?.name || '')
    .replace(/{data}|{date}/gi,    fmtDate)
    .replace(/{hora}|{time}/gi,    appt.time || '')
}

/** Gera link wa.me com a mensagem do template renderizada.
 *  Retorna null se o telefone não for válido.
 */
export async function buildWaLink(appt, statusOverride = null) {
  const phone = appt.clientPhone?.replace(/\D/g, '') ?? ''
  if (!phone) return null
  const status = statusOverride || appt.status || 'pending'
  const templates = await getTemplates()
  const tpl = templates[status] || ''
  const message = renderTemplate(tpl, appt)
  return `https://wa.me/55${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}

/** Versão síncrona — usa templates já carregados (passados como arg). */
export function buildWaLinkSync(appt, templates, statusOverride = null) {
  const phone = appt.clientPhone?.replace(/\D/g, '') ?? ''
  if (!phone) return null
  const status = statusOverride || appt.status || 'pending'
  const tpl = templates?.[status] || ''
  const message = renderTemplate(tpl, appt)
  return `https://wa.me/55${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}
