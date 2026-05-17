import { useMemo, useState } from 'react'
import { BellRing, MessageCircle, Phone, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'

const FILTERS = [
  { id: 'all',  label: 'Todas',          min: 0   },
  { id: 'm30',  label: 'Mais de 30 dias', min: 30 },
  { id: 'm60',  label: 'Mais de 60 dias', min: 60 },
]

const todayISO = () => new Date().toISOString().split('T')[0]
const daysBetween = (a, b) =>
  Math.floor((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000)

function Avatar({ name }) {
  const initials = (name || '?').trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
  return (
    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[14px]"
      style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, var(--color-bg))', color: 'var(--color-accent)' }}>
      {initials}
    </div>
  )
}

export default function RemindersAdmin() {
  const { clients, reminderDays, appointments } = useApp()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const today = todayISO()

  // Para cada cliente: dias sem voltar, último serviço.
  // Considera quem TEM lastVisit e passou de `reminderDays`,
  // ou quem nunca voltou após o 1º agendamento (createdAt antigo).
  const items = useMemo(() => {
    return clients
      .map(c => {
        const lastApt = [...c.appointments].sort((a, b) => b.date.localeCompare(a.date))[0]
        const lastVisit = c.lastVisit || lastApt?.date || ''
        if (!lastVisit) return null
        const days = daysBetween(lastVisit, today)
        if (days < reminderDays) return null
        return {
          ...c,
          daysAway: days,
          lastService: lastApt?.service?.name || '',
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.daysAway - a.daysAway)
  }, [clients, reminderDays, today, appointments])

  const filtered = useMemo(() => {
    const minDays = FILTERS.find(f => f.id === filter)?.min ?? 0
    const q = search.trim().toLowerCase()
    return items
      .filter(c => c.daysAway >= minDays)
      .filter(c => !q || (c.name || '').toLowerCase().includes(q))
  }, [items, filter, search])

  const sendWA = (client) => {
    if (!client.phone) return
    const firstName = (client.name || '').split(' ')[0] || 'oi'
    const msg = encodeURIComponent(
      `Oi ${firstName}! 💕 Faz ${client.daysAway} dias que a gente não se vê. Que tal marcar um horário?`
    )
    const phone = client.phone.replace(/\D/g, '')
    // Adiciona prefixo 55 se não estiver presente
    const intl = phone.startsWith('55') ? phone : `55${phone}`
    window.open(`https://wa.me/${intl}?text=${msg}`, '_blank')
  }

  return (
    <div className="px-4 pt-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' }}>
          <BellRing size={18} strokeWidth={1.5} className="text-accent" />
        </div>
        <div className="flex-1">
          <p className="font-heading text-[18px] font-bold text-label leading-tight">Lembretes de Retorno</p>
          <p className="text-[12px] text-label-2 mt-0.5">
            Clientes sem voltar há mais de {reminderDays} dias
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-3">
        <Search size={14} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar cliente…"
          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-[13px] bg-white focus:outline-none"
          style={{ border: '1px solid rgba(0,0,0,0.06)' }}
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {FILTERS.map(f => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: active ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'transparent',
                color: active ? 'var(--color-accent)' : 'rgba(60,60,67,0.55)',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="ios-card p-8 flex flex-col items-center gap-3 text-center mt-4">
          <BellRing size={28} strokeWidth={1} className="text-label-3" />
          <p className="text-[13px] text-label-2">
            {items.length === 0
              ? 'Nenhuma cliente atrasada no momento'
              : 'Nenhuma cliente nesse filtro'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 pb-6">
          {filtered.map(c => (
            <div key={c.phone || c.email} className="ios-card p-3 flex items-center gap-3">
              <Avatar name={c.name} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-label leading-tight truncate">{c.name || 'Sem nome'}</p>
                {c.lastService && (
                  <p className="text-[11px] text-label-2 truncate">Último: {c.lastService}</p>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-bold" style={{ color: c.daysAway >= 60 ? '#FF3B30' : '#FF9500' }}>
                    {c.daysAway} dias sem voltar
                  </span>
                  {c.phone && (
                    <span className="text-[10px] text-label-3 flex items-center gap-1">
                      <Phone size={9} /> {c.phone}
                    </span>
                  )}
                </div>
              </div>
              {c.phone && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => sendWA(c)}
                  className="px-3 py-2 rounded-xl flex items-center gap-1.5 flex-shrink-0"
                  style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366' }}
                >
                  <MessageCircle size={13} strokeWidth={2} />
                  <span className="text-[11px] font-bold">WhatsApp</span>
                </motion.button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
