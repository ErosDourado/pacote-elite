import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Calendar, Pencil, Save, X, Crown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { brandConfig } from '../brandConfig'

const STATUS_CFG = {
  pending:   { label: 'Pendente',   bg: 'rgba(255,149,0,0.12)',    color: '#FF9500' },
  confirmed: { label: 'Confirmado', bg: 'rgba(52,199,89,0.12)',    color: '#34C759' },
  cancelled: { label: 'Cancelado',  bg: 'rgba(255,59,48,0.12)',    color: '#FF3B30' },
  completed: { label: 'Realizado',  bg: 'rgba(142,142,147,0.12)',  color: '#8E8E93' },
}

export default function Profile({ onNavigate }) {
  const { profile, setProfile, appointments, cancelAppointment, isVipClient } = useApp()
  const isVip = profile.phone ? isVipClient(profile.phone) : false

  // Estado inicial: SEMPRE em modo visualização. Edit só abre via botão de lápis.
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name:  profile.name  || '',
    phone: profile.phone || '',
    email: profile.email || '',
  })

  // Sincroniza form quando profile muda externamente
  useEffect(() => {
    setForm({
      name:  profile.name  || '',
      phone: profile.phone || '',
      email: profile.email || '',
    })
  }, [profile])

  const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const startEdit = () => setEditing(true)
  const cancelEdit = () => {
    setForm({ name: profile.name || '', phone: profile.phone || '', email: profile.email || '' })
    setEditing(false)
  }
  const save = () => { setProfile(form); setEditing(false) }

  const initials = profile.name
    ? profile.name.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : '?'

  const sortedAppts = [...appointments].sort((a, b) => b.date.localeCompare(a.date))

  const fmtDate = iso => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="pb-40">
      {/* ── Header com fundo sólido (gradiente accent) ── */}
      <div
        className="relative px-5 pb-6"
        style={{
          paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
          background: `linear-gradient(145deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 72%, #1D1D1F) 100%)`,
        }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar com badge VIP */}
          <div className="relative flex-shrink-0">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.22)',
                boxShadow: isVip ? '0 0 0 2px #D4AF37' : 'none',
              }}
            >
              <span className="font-heading text-[24px] font-bold text-white">{initials}</span>
            </div>
            {isVip && (
              <div
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: '#D4AF37', boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }}
                title="Cliente VIP"
              >
                <Crown size={13} strokeWidth={2.5} className="text-white" />
              </div>
            )}
          </div>

          {/* Nome + telefone */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-heading text-[20px] font-bold text-white leading-tight truncate">
                {profile.name || 'Bem-vinda!'}
              </p>
              {isVip && (
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: '#D4AF37', color: '#fff' }}
                >
                  VIP
                </span>
              )}
            </div>
            {profile.phone && (
              <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.78)' }}>{profile.phone}</p>
            )}
            {!profile.name && (
              <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{brandConfig.studioName}</p>
            )}
          </div>

          {/* Botão editar — único gatilho para entrar em modo edição */}
          {!editing && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={startEdit}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)' }}
              aria-label="Editar perfil"
            >
              <Pencil size={15} strokeWidth={2} className="text-white" />
            </motion.button>
          )}
        </div>

        {/* Dados de contato visíveis no modo view (substitui stats) */}
        {!editing && (profile.email || profile.phone) && (
          <div className="flex flex-wrap gap-2 mt-5">
            {profile.email && (
              <span
                className="text-[12px] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.95)' }}
              >
                <Mail size={11} strokeWidth={2} /> {profile.email}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Modo Edição (inline) ── */}
      {editing ? (
        <div className="px-4 pt-5 pb-32">
          <div className="ios-card p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="font-heading text-[17px] font-bold text-label">Editar Perfil</p>
              <button
                onClick={cancelEdit}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(120,120,128,0.10)' }}
              >
                <X size={15} strokeWidth={2} className="text-label-2" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { key: 'name',  label: 'Nome',     Icon: User,  type: 'text',  ph: 'Seu nome completo' },
                { key: 'phone', label: 'WhatsApp', Icon: Phone, type: 'tel',   ph: '(11) 99999-9999' },
                { key: 'email', label: 'E-mail',   Icon: Mail,  type: 'email', ph: 'seu@email.com' },
              ].map(f => (
                <label key={f.key} className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide px-1">{f.label}</span>
                  <div className="relative">
                    <f.Icon size={15} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={e => updateForm(f.key, e.target.value)}
                      placeholder={f.ph}
                      className="ios-input pl-9"
                    />
                  </div>
                </label>
              ))}

              <div className="flex gap-3 mt-3">
                <button onClick={cancelEdit} className="btn-tint flex-1">
                  Cancelar
                </button>
                <button onClick={save} className="btn-fill flex-1">
                  <Save size={15} strokeWidth={2} /> Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Modo Visualização: Lista de Agendamentos ── */
        <div className="px-4 pt-5">
          <h2 className="section-label mb-4">Meus Agendamentos</h2>

          {sortedAppts.length === 0 ? (
            <div className="flex flex-col items-center py-12 px-8 gap-5 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(120,120,128,0.10)' }}>
                <Calendar size={28} strokeWidth={1} className="text-label-3" />
              </div>
              <div>
                <p className="text-[17px] font-semibold text-label">Nenhum agendamento</p>
                <p className="text-[14px] text-label-2 mt-1">Que tal marcar seu primeiro horário?</p>
              </div>
              <button onClick={() => onNavigate('scheduling')} className="btn-fill">
                <Calendar size={16} strokeWidth={2} /> Agendar Agora
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedAppts.map(a => {
                const cfg = STATUS_CFG[a.status] ?? STATUS_CFG.pending
                const canCancel = (a.status === 'confirmed' || a.status === 'pending')
                  && new Date(a.date + 'T23:59:59') >= new Date()
                return (
                  <div key={a.id} className="ios-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-label leading-tight">{a.service?.name}</p>
                        <p className="text-[12px] text-label-2 mt-0.5 capitalize">{fmtDate(a.date)} · {a.time}</p>
                        <p className="text-[13px] font-bold text-accent mt-1">R$ {a.service?.price ?? '—'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                        {canCancel && (
                          <button
                            onClick={() => cancelAppointment(a.id)}
                            className="text-[12px] font-medium"
                            style={{ color: '#FF3B30' }}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
