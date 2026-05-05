import { useState, useMemo } from 'react'
import { Search, Users, X, Calendar, ChevronRight, Mail, Phone, Crown, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

const STATUS_LABELS = {
  pending:   { label: 'Pendente',   color: '#FF9500' },
  confirmed: { label: 'Confirmado', color: '#34C759' },
  completed: { label: 'Realizado',  color: '#8E8E93' },
  cancelled: { label: 'Cancelado',  color: '#FF3B30' },
}

// ── Modal de detalhes da cliente ─────────────────────────────────
function ClientDetail({ client, onClose, isVip, onToggleVip, onDelete }) {
  const fmt = iso => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
  const initials = client.name.split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()).join('')

  // Email: do perfil registrado ou de algum agendamento
  const email = client.email || client.appointments.find(a => a.clientEmail)?.clientEmail

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-md z-10 max-h-[88dvh] overflow-y-auto pb-safe"
          style={{ background: 'var(--color-surface)', borderRadius: '28px 28px 0 0' }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onClick={e => e.stopPropagation()}>
          <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />

          {/* Header */}
          <div className="px-5 flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-[20px]"
                  style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, var(--color-bg))', color: 'var(--color-accent)' }}>
                  {initials}
                </div>
                {isVip && (
                  <div
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: '#D4AF37', boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}
                    title="Cliente VIP"
                  >
                    <Crown size={11} strokeWidth={2.5} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-heading text-[17px] font-bold text-label">{client.name}</p>
                {isVip && (
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>VIP</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.12)' }}>
              <X size={16} strokeWidth={2} className="text-label-2" />
            </button>
          </div>

          {/* Contato completo */}
          <div className="px-5 mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(60,60,67,0.4)' }}>Contato</p>
            <div className="ios-section">
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: email ? '0.33px solid rgba(60,60,67,0.12)' : 'none' }}>
                <Phone size={14} strokeWidth={1.5} className="text-accent flex-shrink-0" />
                <span className="text-[14px] text-label">{client.phone}</span>
              </div>
              {email && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Mail size={14} strokeWidth={1.5} className="text-accent flex-shrink-0" />
                  <span className="text-[14px] text-label truncate">{email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="px-5 grid grid-cols-3 gap-2.5 mb-5">
            {[
              { label: 'Visitas',       value: client.appointments.length },
              { label: 'Total gasto',   value: `R$${client.totalSpent.toFixed(0)}` },
              { label: 'Última visita', value: client.lastVisit ? fmt(client.lastVisit) : '—' },
            ].map(s => (
              <div key={s.label} className="ios-card p-3 text-center">
                <p className="font-heading text-[15px] font-bold text-accent">{s.value}</p>
                <p className="text-[10px] text-label-2 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Ações: VIP + Excluir */}
          <div className="px-5 mb-5 flex gap-2">
            <button
              onClick={() => onToggleVip(client.phone)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all"
              style={{
                background: isVip ? 'rgba(212,175,55,0.12)' : 'color-mix(in srgb, var(--color-accent) 8%, transparent)',
                color:      isVip ? '#D4AF37' : 'var(--color-accent)',
                border:     `1.5px solid ${isVip ? '#D4AF37' : 'transparent'}`,
              }}
            >
              <Crown size={14} strokeWidth={2} />
              {isVip ? 'Remover VIP' : 'Tornar VIP'}
            </button>
            <button
              onClick={() => onDelete?.(client.phone)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all"
              style={{
                background: 'rgba(255,59,48,0.1)',
                color: '#FF3B30',
              }}
              aria-label="Excluir cliente"
            >
              <Trash2 size={13} strokeWidth={2} />
              Excluir
            </button>
          </div>

          {/* Histórico de procedimentos */}
          <div className="px-5 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(60,60,67,0.4)' }}>Histórico de Procedimentos</p>
            <div className="ios-section">
              {client.appointments
                .sort((a,b) => b.date.localeCompare(a.date))
                .map((a, i, arr) => {
                  const cfg = STATUS_LABELS[a.status] ?? STATUS_LABELS.pending
                  return (
                    <div key={a.id} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < arr.length-1 ? '0.33px solid rgba(60,60,67,0.12)' : 'none' }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' }}>
                        <Calendar size={13} strokeWidth={1.5} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-label truncate">{a.service?.name}</p>
                        <p className="text-[11px] text-label-2">{fmt(a.date)} · {a.time}</p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-[13px] font-semibold text-accent">R$ {a.service?.price}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: cfg.color }}>{cfg.label}</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Página principal ─────────────────────────────────────────────
export default function ClientsAdmin() {
  const { clients, isVipClient, toggleVip } = useApp()
  const [query,    setQuery]    = useState('')
  const [selected, setSelected] = useState(null)

  // Lista local de telefones "excluídos" (oculta clientes derivados do mock).
  // Quando migrar pra Firestore (coleção `clientes`), trocar por deleteCliente().
  const [hiddenPhones, setHiddenPhones] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('hiddenClients') || '[]')) }
    catch { return new Set() }
  })
  const persistHidden = (next) => {
    setHiddenPhones(next)
    try { localStorage.setItem('hiddenClients', JSON.stringify([...next])) } catch {}
  }
  const deleteClient = (phone) => {
    if (!window.confirm('Excluir esta cliente da lista? Os agendamentos não serão removidos.')) return
    const next = new Set(hiddenPhones)
    next.add(phone)
    persistHidden(next)
    setSelected(null)
  }

  const filtered = useMemo(() =>
    clients
      .filter(c => !hiddenPhones.has(c.phone))
      .filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
      ), [clients, query, hiddenPhones])

  const fmt = iso => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })

  return (
    <div className="px-4 pt-5">
      {/* Busca */}
      <div className="relative mb-4">
        <Search size={15} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
        <input
          className="ios-input pl-9"
          placeholder="Buscar por nome ou telefone"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={14} className="text-label-3" />
          </button>
        )}
      </div>

      <p className="text-[13px] text-label-2 mb-3">{filtered.length} cliente{filtered.length!==1?'s':''}</p>

      {filtered.length === 0 ? (
        <div className="ios-card p-10 flex flex-col items-center gap-3 text-center">
          <Users size={32} strokeWidth={1} className="text-label-3" />
          <p className="text-[15px] text-label-2">
            {query ? 'Nenhum resultado encontrado' : 'Nenhuma cliente ainda'}
          </p>
        </div>
      ) : (
        <div className="ios-section">
          {filtered.map((client, i) => {
            const initials = client.name.split(' ').slice(0,2).map(w=>w[0]?.toUpperCase()).join('')
            const vip = isVipClient(client.phone)
            return (
              <motion.button
                key={client.phone}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(client)}
                className="w-full text-left flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < filtered.length-1 ? '0.33px solid rgba(60,60,67,0.12)' : 'none' }}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px]"
                    style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, var(--color-bg))', color: 'var(--color-accent)' }}>
                    {initials}
                  </div>
                  {vip && (
                    <div
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: '#D4AF37' }}
                    >
                      <Crown size={8} strokeWidth={2.5} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-label">{client.name}</p>
                  <p className="text-[12px] text-label-2">
                    {client.appointments.length > 0
                      ? `${client.appointments.length} visita${client.appointments.length!==1?'s':''} · última em ${fmt(client.lastVisit)}`
                      : 'Sem agendamentos ainda'}
                  </p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-[13px] font-semibold text-accent">R$ {client.totalSpent.toFixed(0)}</span>
                  <ChevronRight size={14} strokeWidth={1.5} className="text-label-3 mt-0.5" />
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      {selected && (
        <ClientDetail
          client={selected}
          onClose={() => setSelected(null)}
          isVip={isVipClient(selected.phone)}
          onToggleVip={toggleVip}
          onDelete={deleteClient}
        />
      )}
    </div>
  )
}
