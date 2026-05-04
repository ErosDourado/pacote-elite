import { useState, useMemo } from 'react'
import { Trash2, Clock, X, Mail, Phone, Users2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import MiniCalendar from '../../components/MiniCalendar'

const STATUS_CFG = {
  pending:   { label: 'Pendente',   bg: 'rgba(255,149,0,0.14)',   color: '#FF9500' },
  confirmed: { label: 'Confirmado', bg: 'rgba(52,199,89,0.14)',   color: '#34C759' },
  completed: { label: 'Concluído',  bg: 'rgba(142,142,147,0.14)', color: '#8E8E93' },
  cancelled: { label: 'Cancelado',  bg: 'rgba(255,59,48,0.14)',   color: '#FF3B30' },
}

const STATUS_FILTERS = [
  { id: 'all',       label: 'Todos'       },
  { id: 'pending',   label: 'Pendentes'   },
  { id: 'confirmed', label: 'Confirmados' },
  { id: 'completed', label: 'Concluídos'  },
  { id: 'cancelled', label: 'Cancelados'  },
]

function WhatsAppIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
    </svg>
  )
}

const fmtDateLong = iso =>
  new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })

const fmtDateShort = iso =>
  new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })

const fmtPhone = p =>
  p ? p.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : '—'

/** Aplica template de WA substituindo placeholders */
function renderTemplate(template, appt) {
  return (template || '')
    .replace(/{nome}|{clientName}/gi, appt.clientName || '')
    .replace(/{servico}|{service}/gi, appt.service?.name || '')
    .replace(/{data}|{date}/gi, fmtDateLong(appt.date))
    .replace(/{hora}|{time}/gi, appt.time || '')
}

function buildWaLink(appt, templates) {
  const phone = appt.clientPhone?.replace(/\D/g, '') ?? ''
  if (!phone) return ''
  const tpl = templates?.[appt.status] || ''
  const msg = renderTemplate(tpl, appt)
  return `https://wa.me/55${phone}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`
}

// ── Modal de detalhes/ações do agendamento ─────────────────────
function ApptDetailModal({ appt, onClose, onUpdateStatus, onDelete, waTemplates }) {
  if (!appt) return null
  const cfg = STATUS_CFG[appt.status] ?? STATUS_CFG.pending
  const waLink = buildWaLink(appt, waTemplates)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-md z-10 max-h-[92dvh] overflow-y-auto pb-safe"
          style={{ background: 'var(--color-surface)', borderRadius: '28px 28px 0 0' }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />

          <div className="px-5 flex items-center justify-between mb-5">
            <p className="font-heading text-[18px] font-bold text-label">Detalhes</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.12)' }}>
              <X size={16} strokeWidth={2} className="text-label-2" />
            </button>
          </div>

          <div className="px-5 pb-6 flex flex-col gap-4">
            {/* Status badge */}
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: cfg.bg, color: cfg.color }}
              >
                {cfg.label}
              </span>
              <p className="text-[12px] text-label-2 capitalize">{fmtDateShort(appt.date)} · {appt.time}</p>
            </div>

            {/* Cliente */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(60,60,67,0.4)' }}>Cliente</p>
              <p className="text-[16px] font-bold text-label">{appt.clientName}</p>
              {appt.clientEmail && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-label-2">
                  <Mail size={12} strokeWidth={1.5} /> {appt.clientEmail}
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-1 text-[12px] text-label-2">
                <Phone size={12} strokeWidth={1.5} /> {fmtPhone(appt.clientPhone)}
              </div>
            </div>

            {/* Serviço */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(120,120,128,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(60,60,67,0.4)' }}>Serviço</p>
              <p className="text-[15px] font-semibold text-label">{appt.service?.name}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[14px] font-bold text-accent">R$ {appt.service?.price}</span>
                <span className="text-[12px] text-label-2">{appt.service?.duration}min</span>
              </div>
            </div>

            {/* Mudança de status */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(60,60,67,0.5)' }}>Alterar status</label>
              <select
                className="w-full rounded-xl px-3 py-3 text-[14px] font-semibold focus:outline-none cursor-pointer"
                style={{ border: '1px solid rgba(60,60,67,0.18)', background: 'white' }}
                value={appt.status}
                onChange={e => onUpdateStatus(appt.id, e.target.value)}
              >
                <option value="pending">Pendente</option>
                <option value="confirmed">Confirmado</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Ações */}
            <div className="flex gap-2 mt-2">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-colors"
                >
                  <WhatsAppIcon size={14} /> WhatsApp
                </a>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Excluir este agendamento?')) {
                    onDelete(appt.id)
                    onClose()
                  }
                }}
                className="px-4 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest"
                style={{ background: 'rgba(255,59,48,0.1)', color: '#FF3B30' }}
              >
                <Trash2 size={14} strokeWidth={2} className="inline mr-1" /> Excluir
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function AppointmentsAdmin() {
  const {
    appointments, deleteAppointment, updateAppointmentStatus, waTemplates,
    findWaitlistCandidates, markWaitlistNotified,
    waitlist, removeFromWaitlist,
  } = useApp()
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [activeId, setActiveId] = useState(null)
  const [waitlistFor, setWaitlistFor] = useState(null) // { slot, candidates } quando vaga abre
  const [showWaitlist, setShowWaitlist] = useState(false) // botão "Fila de espera"

  // Conta entries pendentes de notificação (não notificadas ainda)
  const waitlistPendingCount = (waitlist || []).filter(w => !w.notifiedAt).length

  // Wrapper: quando status muda pra cancelado, abre modal de fila se houver candidatos
  const handleStatusChange = (id, status) => {
    const appt = appointments.find(a => a.id === id)
    updateAppointmentStatus(id, status)
    if (status === 'cancelled' && appt) {
      const candidates = findWaitlistCandidates({
        date: appt.date,
        time: appt.time,
        serviceId: appt.service?.id,
      })
      if (candidates.length > 0) {
        setWaitlistFor({
          slot: { date: appt.date, time: appt.time, service: appt.service },
          candidates,
        })
      }
    }
  }

  const markedDates = useMemo(() => {
    const map = {}
    appointments.forEach(a => {
      if (!map[a.date]) map[a.date] = { count: 0, color: 'var(--color-accent)' }
      map[a.date].count++
    })
    return map
  }, [appointments])

  const filtered = useMemo(() => {
    return appointments
      .filter(a => a.date === selectedDate)
      .filter(a => statusFilter === 'all' ? true : a.status === statusFilter)
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [appointments, statusFilter, selectedDate])

  const activeAppt = appointments.find(a => a.id === activeId)

  return (
    <div className="px-4 pt-5">
      {/* Cabeçalho: filtros + botão fila de espera (minimalista) */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0 -mx-1 px-1">
          {STATUS_FILTERS.map(f => {
            const active = statusFilter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className="flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all"
                style={{
                  border: `1px solid ${active ? 'var(--color-accent)' : 'rgba(60,60,67,0.18)'}`,
                  color:  active ? 'var(--color-accent)' : 'rgba(60,60,67,0.55)',
                  background: 'white',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Botão Fila de Espera */}
        <button
          onClick={() => setShowWaitlist(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all relative"
          style={{
            background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
            color: 'var(--color-accent)',
            border: '1px solid color-mix(in srgb, var(--color-accent) 18%, transparent)',
          }}
          aria-label="Fila de espera"
        >
          <Users2 size={13} strokeWidth={2} />
          Fila
          {waitlistPendingCount > 0 && (
            <span
              className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-black px-1"
              style={{ background: '#FF9500', color: '#fff' }}
            >
              {waitlistPendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Calendário */}
      <div
        className="bg-white rounded-2xl p-4 mb-4"
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.05)' }}
      >
        <MiniCalendar
          selectedDate={selectedDate}
          onDateClick={setSelectedDate}
          markedDates={markedDates}
        />
      </div>

      {/* Contagem */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-label capitalize font-semibold">{fmtDateShort(selectedDate)}</p>
        <span className="text-[11px] uppercase tracking-widest font-bold" style={{ color: 'rgba(60,60,67,0.4)' }}>
          {filtered.length} encontrado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista — cards resumidos clicáveis */}
      {filtered.length === 0 ? (
        <div
          className="rounded-2xl bg-white p-10 flex flex-col items-center gap-3 text-center"
          style={{ border: '1px solid rgba(0,0,0,0.05)' }}
        >
          <Clock size={28} strokeWidth={1} style={{ color: 'rgba(60,60,67,0.25)' }} />
          <p className="text-[13px]" style={{ color: 'rgba(60,60,67,0.45)' }}>Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 pb-4">
          {filtered.map(a => {
            const cfg = STATUS_CFG[a.status] ?? STATUS_CFG.pending
            return (
              <motion.button
                key={a.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveId(a.id)}
                className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                {/* Hora destacada */}
                <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
                  <p className="text-[16px] font-bold leading-none" style={{ color: 'var(--color-accent)' }}>{a.time.split(':')[0]}</p>
                  <p className="text-[10px] leading-none mt-0.5" style={{ color: 'rgba(60,60,67,0.45)' }}>:{a.time.split(':')[1]}</p>
                </div>

                {/* Separador */}
                <div className="w-px h-10" style={{ background: 'rgba(60,60,67,0.1)' }} />

                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-label leading-tight truncate">{a.clientName}</p>
                  <p className="text-[12px] mt-0.5 truncate" style={{ color: 'rgba(60,60,67,0.55)' }}>{a.service?.name}</p>
                </div>

                {/* Badge de status */}
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  {cfg.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Modal de detalhes */}
      <ApptDetailModal
        appt={activeAppt}
        onClose={() => setActiveId(null)}
        onUpdateStatus={handleStatusChange}
        onDelete={deleteAppointment}
        waTemplates={waTemplates}
      />

      {/* Modal de fila de espera (ao cancelar agendamento) */}
      <WaitlistAdminModal
        data={waitlistFor}
        waTemplates={waTemplates}
        onClose={() => setWaitlistFor(null)}
        onMarkNotified={markWaitlistNotified}
      />

      {/* Modal: Lista completa da Fila de Espera (botão no topo) */}
      <WaitlistListModal
        open={showWaitlist}
        waitlist={waitlist || []}
        waTemplates={waTemplates}
        onClose={() => setShowWaitlist(false)}
        onMarkNotified={markWaitlistNotified}
        onRemove={removeFromWaitlist}
      />
    </div>
  )
}

// ── Modal: Lista completa da Fila de Espera ─────────────────────
function WaitlistListModal({ open, waitlist, waTemplates, onClose, onMarkNotified, onRemove }) {
  if (!open) return null

  const fmtBR = iso => {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  // Pendentes primeiro, depois notificadas
  const sorted = [...waitlist].sort((a, b) => {
    if (!a.notifiedAt && b.notifiedAt) return -1
    if (a.notifiedAt && !b.notifiedAt) return 1
    return (b.createdAt || '').localeCompare(a.createdAt || '')
  })

  const buildLink = (entry) => {
    const phone = entry.clientPhone?.replace(/\D/g, '') ?? ''
    if (!phone) return ''
    const tpl = waTemplates?.waitlist || ''
    const fmtDate = entry.preferredDate
      ? new Date(entry.preferredDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
      : ''
    const msg = (tpl || 'Olá {nome}! Sobre sua vaga de {servico} no dia {data} às {hora}.')
      .replace(/{nome}|{clientName}/gi, entry.clientName || '')
      .replace(/{servico}|{service}/gi, entry.serviceName || '')
      .replace(/{data}|{date}/gi, fmtDate)
      .replace(/{hora}|{time}/gi, entry.preferredTime || '')
    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-md z-10 max-h-[88dvh] overflow-y-auto pb-safe"
          style={{ background: 'var(--color-surface)', borderRadius: '28px 28px 0 0' }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />

          <div className="px-5 flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' }}
              >
                <Users2 size={18} strokeWidth={1.75} className="text-accent" />
              </div>
              <div>
                <p className="font-heading text-[16px] font-bold text-label leading-tight">
                  Fila de espera
                </p>
                <p className="text-[12px] text-label-2 mt-0.5">
                  {sorted.length} {sorted.length === 1 ? 'cliente' : 'clientes'} aguardando
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.12)' }}>
              <X size={16} strokeWidth={2} className="text-label-2" />
            </button>
          </div>

          <div className="px-5 pb-6">
            {sorted.length === 0 ? (
              <div className="text-center py-12">
                <Users2 size={36} strokeWidth={1} style={{ color: 'rgba(60,60,67,0.25)' }} className="mx-auto mb-3" />
                <p className="text-[13px]" style={{ color: 'rgba(60,60,67,0.55)' }}>
                  Ninguém na fila no momento
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {sorted.map(entry => {
                  const link = buildLink(entry)
                  const notified = !!entry.notifiedAt
                  return (
                    <div
                      key={entry.id}
                      className="rounded-2xl p-3.5 bg-white"
                      style={{
                        border: '1px solid rgba(0,0,0,0.05)',
                        opacity: notified ? 0.55 : 1,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-bold text-label">{entry.clientName}</p>
                            {notified && (
                              <span
                                className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(52,199,89,0.14)', color: '#34C759' }}
                              >
                                Avisada
                              </span>
                            )}
                            {entry.wantEarlier && !notified && (
                              <span
                                className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(255,149,0,0.14)', color: '#FF9500' }}
                              >
                                Vaga antes
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-label-2 mt-0.5">{fmtPhone(entry.clientPhone)}</p>
                          {entry.serviceName && (
                            <p className="text-[11px] mt-1" style={{ color: 'rgba(60,60,67,0.55)' }}>
                              {entry.serviceName}
                            </p>
                          )}
                          {entry.preferredDate && (
                            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(60,60,67,0.4)' }}>
                              quer: {fmtBR(entry.preferredDate)} às {entry.preferredTime}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {link && !notified && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onMarkNotified(entry.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors"
                          >
                            <WhatsAppIcon size={12} /> Avisar
                          </a>
                        )}
                        {!notified && (
                          <button
                            onClick={() => onMarkNotified(entry.id)}
                            className="px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                            style={{ background: 'rgba(120,120,128,0.1)', color: 'rgba(60,60,67,0.7)' }}
                          >
                            Já avisei
                          </button>
                        )}
                        <button
                          onClick={() => window.confirm('Remover da fila?') && onRemove(entry.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0"
                          style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30' }}
                          aria-label="Remover"
                        >
                          <Trash2 size={13} strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Modal: Fila de Espera (admin) ─────────────────────────────
function WaitlistAdminModal({ data, waTemplates, onClose, onMarkNotified }) {
  if (!data) return null
  const { slot, candidates } = data
  const fmtBR = iso => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }

  // Renderiza template waitlist com os dados do candidato + slot que abriu
  const buildWaitlistLink = (cand) => {
    const phone = cand.clientPhone?.replace(/\D/g, '') ?? ''
    if (!phone) return ''
    const tpl = waTemplates?.waitlist || ''
    const fmtDate = new Date(slot.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
    const msg = (tpl || 'Olá {nome}! Abriu uma vaga para {servico} no dia {data} às {hora}. Tem interesse?')
      .replace(/{nome}|{clientName}/gi, cand.clientName || '')
      .replace(/{servico}|{service}/gi, slot.service?.name || '')
      .replace(/{data}|{date}/gi, fmtDate)
      .replace(/{hora}|{time}/gi, slot.time || '')
    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          id="waitlist-modal"
          className="relative w-full max-w-md z-10 max-h-[88dvh] overflow-y-auto pb-safe"
          style={{ background: 'var(--color-surface)', borderRadius: '28px 28px 0 0' }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />

          <div className="px-5 flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,149,0,0.14)' }}
              >
                <span style={{ fontSize: 20 }}>🔔</span>
              </div>
              <div>
                <p className="font-heading text-[16px] font-bold text-label leading-tight">
                  Vaga aberta!
                </p>
                <p className="text-[12px] text-label-2 mt-0.5">
                  {fmtBR(slot.date)} às {slot.time} · {slot.service?.name}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.12)' }}>
              <X size={16} strokeWidth={2} className="text-label-2" />
            </button>
          </div>

          <div className="px-5 pb-6">
            <p className="text-[11px] text-label-2 mb-3">
              {candidates.length} cliente{candidates.length !== 1 ? 's' : ''} aguardando essa vaga (ou anterior).
              Avise no WhatsApp e marque como notificado.
            </p>

            <div className="flex flex-col gap-2.5">
              {candidates.map(c => {
                const link = buildWaitlistLink(c)
                return (
                  <div
                    key={c.id}
                    className="rounded-2xl p-3.5 bg-white"
                    style={{ border: '1px solid rgba(0,0,0,0.05)' }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-label">{c.clientName}</p>
                        <p className="text-[11px] text-label-2">{fmtPhone(c.clientPhone)}</p>
                        {c.preferredDate && (
                          <p className="text-[10px] text-label-3 mt-1">
                            queria: {fmtBR(c.preferredDate)} às {c.preferredTime}
                            {c.wantEarlier && ' · aceita antes'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => onMarkNotified(c.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors"
                        >
                          <WhatsAppIcon size={12} /> Avisar
                        </a>
                      )}
                      <button
                        onClick={() => onMarkNotified(c.id)}
                        className="px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(120,120,128,0.1)', color: 'rgba(60,60,67,0.7)' }}
                      >
                        Já avisei
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 rounded-xl font-medium text-[12px]"
              style={{ background: 'transparent', color: 'var(--color-secondary)' }}
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
