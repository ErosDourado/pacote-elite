import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, User, Phone, Mail, Pencil } from 'lucide-react'
import { brandConfig } from '../brandConfig'
import { useApp } from '../context/AppContext'
import MiniCalendar from '../components/MiniCalendar'
import { getServiceIcon } from '../components/ServiceIcons'

// ── Persistência do fluxo de agendamento ─────────────────────────
const BOOKING_KEY = 'booking_flow'
const loadBooking = () => {
  try { return JSON.parse(sessionStorage.getItem(BOOKING_KEY)) || null } catch { return null }
}
const saveBooking = (state) => {
  try { sessionStorage.setItem(BOOKING_KEY, JSON.stringify(state)) } catch {}
}
const clearBooking = () => {
  try { sessionStorage.removeItem(BOOKING_KEY) } catch {}
}

const STEPS = [
  { n: 1, label: 'Serviço'      },
  { n: 2, label: 'Data e hora'  },
  { n: 3, label: 'Seus dados'   },
  { n: 4, label: 'Confirmação'  },
]

// ── Hero strip (faixa colorida no topo) ───────────────────────────
function Hero() {
  return (
    <div
      className="px-4 py-7 text-center text-white"
      style={{ background: 'var(--color-accent)' }}
    >
      <h1 className="font-black text-[20px] uppercase tracking-tight mb-1">
        Agende seu atendimento
      </h1>
      <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
        Escolha o serviço, data e horário de sua preferência
      </p>
    </div>
  )
}

// ── Progress bar com bolinhas numeradas + linhas conectoras ──────
function Progress({ step }) {
  return (
    <div
      className="px-4 py-4"
      style={{
        background: 'var(--color-surface)',
        borderBottom: '0.33px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center max-w-3xl mx-auto">
        {STEPS.map((s, i) => {
          const isDone = step > s.n
          const isCurr = step === s.n
          return (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0 transition-colors duration-300"
                  style={{
                    background: isDone
                      ? 'color-mix(in srgb, var(--color-accent) 72%, white)'
                      : isCurr
                        ? 'var(--color-accent)'
                        : 'rgba(120,120,128,0.18)',
                    color: (isDone || isCurr) ? '#fff' : 'rgba(60,60,67,0.4)',
                  }}
                >
                  {isDone ? '✓' : s.n}
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider hidden sm:block transition-colors duration-300"
                  style={{
                    color: isDone || isCurr
                      ? 'var(--color-accent)'
                      : 'rgba(60,60,67,0.35)',
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-px mx-2 transition-colors duration-300"
                  style={{
                    background: isDone
                      ? 'color-mix(in srgb, var(--color-accent) 60%, white)'
                      : 'rgba(120,120,128,0.25)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Botão "Voltar" interno ───────────────────────────────────────
function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[12px] font-bold mb-5 transition-colors"
      style={{ color: 'rgba(60,60,67,0.55)' }}
    >
      <ArrowLeft size={14} strokeWidth={2.5} /> Voltar
    </button>
  )
}

// ── STEP 1 — Escolha do serviço ──────────────────────────────────
function StepService({ services, selected, onSelect }) {
  return (
    <div>
      <h2
        className="font-black text-[15px] uppercase tracking-tight mb-5"
        style={{ color: '#1D1D1F' }}
      >
        Qual serviço você deseja?
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {services.map(svc => {
          const active = selected?.id === svc.id
          const Icon = getServiceIcon(svc.icon)
          return (
            <motion.button
              key={svc.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(svc)}
              className="text-left p-4 rounded-2xl transition-all duration-150 bg-white"
              style={{
                border: `2px solid ${active ? 'var(--color-accent)' : 'rgba(0,0,0,0.06)'}`,
                background: active
                  ? 'color-mix(in srgb, var(--color-accent) 6%, white)'
                  : 'white',
                boxShadow: '0 1px 2px rgba(0,0,0,0.035)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' }}
              >
                <Icon size={18} strokeWidth={1.5} className="text-accent" />
              </div>
              <h3 className="font-bold text-[12px] uppercase tracking-wide leading-tight mb-1" style={{ color: '#1D1D1F' }}>
                {svc.name}
              </h3>
              <p className="text-[11px] leading-snug line-clamp-2" style={{ color: 'rgba(60,60,67,0.55)' }}>
                {svc.description}
              </p>
              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '0.33px solid rgba(60,60,67,0.12)' }}>
                <span className="text-[12px] font-bold text-accent">R$ {svc.price}</span>
                <span className="text-[10px]" style={{ color: 'rgba(60,60,67,0.45)' }}>· {svc.duration}min</span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ── Header minimalista mostrando o serviço escolhido + Alterar ──
function SelectedServiceHeader({ service, onChange }) {
  if (!service) return null
  const Icon = getServiceIcon(service.icon)
  return (
    <div
      className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-white"
      style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 2px rgba(0,0,0,0.035)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' }}
      >
        <Icon size={18} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(60,60,67,0.45)' }}>
          Agendando
        </p>
        <p className="text-[14px] font-bold text-label leading-tight truncate">{service.name}</p>
      </div>
      <button
        onClick={onChange}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors flex-shrink-0"
        style={{ background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)', color: 'var(--color-accent)' }}
      >
        <Pencil size={11} strokeWidth={2.5} /> Alterar
      </button>
    </div>
  )
}

// ── STEP 2 — Data e hora ─────────────────────────────────────────
function StepDateTime({ selectedDate, selectedTime, onPickDate, onPickTime, takenSlots, blockedDates, onBack, service, onChangeService }) {
  return (
    <div>
      <SelectedServiceHeader service={service} onChange={onChangeService} />
      <BackButton onClick={onBack} />

      {/* Calendário */}
      <div
        className="bg-white rounded-2xl p-4 mb-4"
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.035)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <MiniCalendar
          selectedDate={selectedDate}
          onDateClick={onPickDate}
          disablePast
          blockedWeekdays={[0]}
          blockedDates={blockedDates}
        />
      </div>

      {/* Horários */}
      <div
        className="bg-white rounded-2xl p-4"
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.035)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-4"
          style={{ color: 'rgba(60,60,67,0.45)' }}
        >
          Horários disponíveis
        </p>
        {!selectedDate ? (
          <div className="text-center py-6 text-[12px]" style={{ color: 'rgba(60,60,67,0.35)' }}>
            Selecione uma data
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {brandConfig.availableHours.map(h => {
              const taken  = takenSlots.includes(h)
              const active = selectedTime === h
              return (
                <button
                  key={h}
                  disabled={taken}
                  onClick={() => onPickTime(h)}
                  className="py-2.5 text-[12px] font-bold rounded-xl transition-all"
                  style={{
                    border: `2px solid ${
                      active
                        ? 'var(--color-accent)'
                        : taken
                          ? 'rgba(120,120,128,0.15)'
                          : 'rgba(120,120,128,0.2)'
                    }`,
                    background: active
                      ? 'color-mix(in srgb, var(--color-accent) 12%, white)'
                      : taken
                        ? 'rgba(120,120,128,0.05)'
                        : 'white',
                    color: active
                      ? 'var(--color-accent)'
                      : taken
                        ? 'rgba(60,60,67,0.3)'
                        : 'rgba(60,60,67,0.75)',
                    cursor: taken ? 'not-allowed' : 'pointer',
                    textDecoration: taken ? 'line-through' : 'none',
                  }}
                >
                  {h}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── STEP 3 — Dados do cliente ────────────────────────────────────
function StepData({ booking, name, phone, email, onName, onPhone, onEmail, wantNotified, onWantNotified, error, onBack }) {
  const fmtBR = iso => {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div>
      <BackButton onClick={onBack} />

      {/* Resumo */}
      <div
        className="bg-white rounded-2xl p-5 mb-4"
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.035)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-3"
          style={{ color: 'rgba(60,60,67,0.45)' }}
        >
          Resumo do agendamento
        </p>
        <div className="flex flex-col text-[13px]">
          {[
            ['Serviço', booking.service?.name],
            ['Data',    fmtBR(booking.date)],
            ['Horário', booking.time],
          ].map(([l, v], i, arr) => (
            <div
              key={l}
              className="flex items-center justify-between py-2.5"
              style={{ borderBottom: i < arr.length - 1 ? '0.33px solid rgba(60,60,67,0.12)' : 'none' }}
            >
              <span
                className="text-[9px] uppercase tracking-widest font-bold"
                style={{ color: 'rgba(60,60,67,0.45)' }}
              >
                {l}
              </span>
              <span className="font-bold text-right max-w-[60%]" style={{ color: '#1D1D1F' }}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <div
        className="bg-white rounded-2xl p-5 flex flex-col gap-4"
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.035)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <h2
          className="font-black text-[15px] uppercase tracking-tight"
          style={{ color: '#1D1D1F' }}
        >
          Seus dados
        </h2>

        {[
          { key: 'name',  label: 'Nome completo *',     Icon: User,  type: 'text',  ph: 'Seu nome completo',   value: name,  setter: onName  },
          { key: 'phone', label: 'Celular (WhatsApp) *', Icon: Phone, type: 'tel',   ph: '(11) 99999-9999',     value: phone, setter: onPhone },
          { key: 'email', label: 'E-mail',                Icon: Mail,  type: 'email', ph: 'seu@email.com',       value: email, setter: onEmail },
        ].map(f => (
          <label key={f.key} className="flex flex-col gap-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(60,60,67,0.55)' }}
            >
              {f.label}
            </span>
            <div className="relative">
              <f.Icon size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(60,60,67,0.4)' }} />
              <input
                type={f.type}
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                placeholder={f.ph}
                className="w-full rounded-xl px-4 py-3 pl-9 text-[13px] focus:outline-none transition-all"
                style={{
                  border: '1px solid rgba(60,60,67,0.18)',
                  background: 'white',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(60,60,67,0.18)'}
              />
            </div>
          </label>
        ))}

        {error && (
          <p className="text-red-500 text-[12px]">{error}</p>
        )}
      </div>

      {/* Toggle: me avisar se abrir vaga antes (minimalista) */}
      <label
        className="flex items-center gap-3 mt-3 px-4 py-3 rounded-2xl bg-white cursor-pointer transition-all"
        style={{
          border: `1px solid ${wantNotified ? 'var(--color-accent)' : 'rgba(0,0,0,0.05)'}`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.035)',
          background: wantNotified ? 'color-mix(in srgb, var(--color-accent) 4%, white)' : 'white',
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
          style={{
            background: wantNotified
              ? 'color-mix(in srgb, var(--color-accent) 14%, transparent)'
              : 'rgba(120,120,128,0.08)',
          }}
        >
          <span style={{ fontSize: 16 }}>🔔</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold leading-tight" style={{ color: '#1D1D1F' }}>
            Me avisar se abrir vaga antes
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(60,60,67,0.55)' }}>
            Entramos em contato pelo WhatsApp
          </p>
        </div>
        {/* Switch visual */}
        <div
          className="relative flex-shrink-0 rounded-full transition-colors"
          style={{
            width: 38, height: 22,
            background: wantNotified ? 'var(--color-accent)' : 'rgba(120,120,128,0.25)',
          }}
        >
          <input
            type="checkbox"
            checked={!!wantNotified}
            onChange={e => onWantNotified(e.target.checked)}
            className="sr-only"
          />
          <div
            className="absolute top-0.5 rounded-full bg-white shadow-sm transition-all"
            style={{
              width: 18, height: 18,
              left: wantNotified ? 18 : 2,
            }}
          />
        </div>
      </label>
    </div>
  )
}

// ── STEP 4 — Confirmação (sucesso) ───────────────────────────────
function StepDone({ booking, onReset }) {
  const fmtBR = iso => {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }
  const msg = encodeURIComponent(
    `Olá! Gostaria de confirmar meu agendamento:\n\n*Serviço:* ${booking.service?.name}\n*Data:* ${fmtBR(booking.date)}\n*Horário:* ${booking.time}\n*Nome:* ${booking.clientName}`
  )
  const waLink = `https://wa.me/${brandConfig.whatsappNumber}?text=${msg}`

  return (
    <motion.div
      className="text-center py-10 px-4"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.12, type: 'spring', stiffness: 400, damping: 22 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: 'color-mix(in srgb, var(--color-accent) 16%, transparent)' }}
      >
        <Check size={36} strokeWidth={2.5} className="text-accent" />
      </motion.div>

      <h2
        className="font-black text-[20px] uppercase tracking-tight mb-3"
        style={{ color: '#1D1D1F' }}
      >
        Agendamento confirmado!
      </h2>
      <p
        className="text-[13px] max-w-[320px] mx-auto mb-7"
        style={{ color: 'rgba(60,60,67,0.65)' }}
      >
        Recebemos sua solicitação. Em breve entraremos em contato pelo WhatsApp para confirmar.
      </p>

      <div
        className="bg-white rounded-2xl p-5 max-w-sm mx-auto text-left mb-7"
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.035)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-3"
          style={{ color: 'rgba(60,60,67,0.45)' }}
        >
          Detalhes
        </p>
        <div className="flex flex-col gap-2 text-[13px]">
          {[
            ['Serviço', booking.service?.name],
            ['Data',    fmtBR(booking.date)],
            ['Horário', booking.time],
            ['Nome',    booking.clientName],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between">
              <span style={{ color: 'rgba(60,60,67,0.6)' }}>{l}</span>
              <span className="font-bold" style={{ color: '#1D1D1F' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold text-[13px] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/>
          </svg>
          Falar no WhatsApp
        </a>
        <button
          onClick={onReset}
          className="py-3.5 rounded-xl font-bold text-[13px] transition-colors"
          style={{
            border: '1px solid rgba(60,60,67,0.18)',
            color: 'rgba(60,60,67,0.7)',
            background: 'white',
          }}
        >
          Novo agendamento
        </button>
      </div>
    </motion.div>
  )
}

// ── Modal de Slot Ocupado / Fila de Espera ─────────────────────
function WaitlistModal({ slot, service, name, phone, email, onClose, onJoin }) {
  const [wantEarlier, setWantEarlier] = useState(false)
  if (!slot) return null
  const fmtBR = iso => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-md z-10 pb-safe"
          style={{ background: 'var(--color-surface)', borderRadius: '28px 28px 0 0' }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />
          <div className="px-5 pb-6">
            {/* Aviso */}
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,149,0,0.14)' }}
              >
                <span style={{ fontSize: 20 }}>⏰</span>
              </div>
              <div className="flex-1">
                <p className="font-heading text-[16px] font-bold text-label leading-tight">
                  Horário já ocupado
                </p>
                <p className="text-[12px] text-label-2 mt-1">
                  {fmtBR(slot.date)} às {slot.time} foi reservado por outra cliente.
                </p>
              </div>
            </div>

            {/* Card resumo do desejo */}
            <div
              className="rounded-2xl p-3 mb-4"
              style={{ background: 'rgba(120,120,128,0.06)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(60,60,67,0.45)' }}>
                Você queria
              </p>
              <p className="text-[13px] font-semibold text-label">{service?.name}</p>
              <p className="text-[12px] text-label-2 mt-0.5">{fmtBR(slot.date)} · {slot.time}</p>
            </div>

            {/* Toggle wantEarlier */}
            <label
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-4"
              style={{
                background: wantEarlier ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'rgba(120,120,128,0.06)',
                border: `1.5px solid ${wantEarlier ? 'var(--color-accent)' : 'transparent'}`,
              }}
            >
              <input
                type="checkbox"
                checked={wantEarlier}
                onChange={e => setWantEarlier(e.target.checked)}
                className="w-5 h-5"
                style={{ accentColor: 'var(--color-accent)' }}
              />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-label">Aceito uma vaga mais cedo</p>
                <p className="text-[11px] text-label-2 mt-0.5">Te aviso se abrir antes da sua data preferida</p>
              </div>
            </label>

            <p className="text-[12px] text-label-2 mb-4 text-center">
              Entre na <strong>fila de espera</strong> e nós te avisamos pelo WhatsApp se essa vaga abrir.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => onJoin({ wantEarlier })}
                className="w-full py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-widest text-white transition-colors"
                style={{ background: 'var(--color-accent)' }}
              >
                Entrar na fila de espera
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-medium text-[13px]"
                style={{ background: 'transparent', color: 'var(--color-secondary)' }}
              >
                Escolher outro horário
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Página principal — wizard de 4 passos ────────────────────────
export default function Scheduling({ pageState }) {
  const {
    services, appointments, addAppointment, profile,
    isSlotTaken, addToWaitlist, blocks,
  } = useApp()

  // Estado inicial — recupera de sessionStorage se existir (persistência ao recarregar)
  const persisted = loadBooking()

  const [step,  setStep]  = useState(persisted?.step  ?? 1)
  const [svc,   setSvc]   = useState(persisted?.svc   ?? null)
  const [date,  setDate]  = useState(persisted?.date  ?? '')
  const [time,  setTime]  = useState(persisted?.time  ?? '')
  const [name,  setName]  = useState(persisted?.name  ?? profile.name  ?? '')
  const [phone, setPhone] = useState(persisted?.phone ?? profile.phone ?? '')
  const [email, setEmail] = useState(persisted?.email ?? profile.email ?? '')
  const [error, setError] = useState('')
  const [done,  setDone]  = useState(null)
  const [slotConflict, setSlotConflict] = useState(null) // {date, time} quando ocupado
  const [waitlistJoined, setWaitlistJoined] = useState(false)
  const [wantNotified,   setWantNotified]  = useState(false) // toggle "me avisa vaga antes"

  // Deep-link: se vier `selectedServiceId` via pageState, pula direto pro Step 2
  useEffect(() => {
    const targetId = pageState?.selectedServiceId
    if (!targetId) return
    const target = services.find(s => String(s.id) === String(targetId))
    if (target) {
      setSvc(target)
      setStep(2)
      setError('')
    }
    // O pageState é "consumido" no primeiro render — não precisamos limpar aqui
    // porque ao navegar para outra página o App seta um novo state ou null.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState?.selectedServiceId])

  // Persistência: salva o fluxo a cada mudança relevante
  useEffect(() => {
    if (done) return
    saveBooking({ step, svc, date, time, name, phone, email })
  }, [step, svc, date, time, name, phone, email, done])

  // Datas totalmente bloqueadas pelo admin
  const blockedDates = useMemo(() =>
    blocks.filter(b => b.times === 'all').map(b => b.date),
  [blocks])

  // Slots já ocupados na data selecionada (agendamentos + bloqueios do admin)
  const takenSlots = useMemo(() => {
    if (!date) return []
    const fromAppts = appointments
      .filter(a => a.date === date && a.status !== 'cancelled')
      .map(a => a.time)
    const block = blocks.find(b => b.date === date)
    if (block?.times === 'all') return brandConfig.availableHours
    const fromBlocks = block?.times ?? []
    return [...new Set([...fromAppts, ...fromBlocks])]
  }, [appointments, blocks, date])

  const goToStep = (n) => {
    setError('')
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePickService = (s) => {
    setSvc(s)
    setTimeout(() => goToStep(2), 250)
  }

  const handlePickDate = (d) => {
    setDate(d)
    setTime('') // reset hora quando muda data
  }

  const handleContinueDateTime = () => {
    if (!date || !time) return
    goToStep(3)
  }

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      setError('Preencha nome e celular para continuar.')
      return
    }
    // Validação anti double-booking: se o slot foi ocupado entre a escolha
    // e a confirmação, abre o modal de fila de espera.
    if (isSlotTaken(date, time)) {
      setError('')
      setSlotConflict({ date, time })
      return
    }
    const a = addAppointment({
      service:     svc,
      date,
      time,
      clientName:  name.trim(),
      clientPhone: phone.trim(),
      clientEmail: email.trim(),
    })

    // Se a cliente marcou "me avisa se abrir vaga antes", entra na fila
    // mesmo com o agendamento confirmado (wantEarlier: true).
    if (wantNotified) {
      addToWaitlist({
        clientName:    name.trim(),
        clientPhone:   phone.trim(),
        clientEmail:   email.trim(),
        serviceId:     String(svc?.id ?? ''),
        serviceName:   svc?.name ?? '',
        preferredDate: date,
        preferredTime: time,
        wantEarlier:   true,
      })
    }

    setDone({ ...a, service: svc, clientName: name.trim() })
    clearBooking() // limpa fluxo após confirmar
    goToStep(4)
  }

  // Cliente decidiu entrar na fila de espera
  const handleJoinWaitlist = ({ wantEarlier }) => {
    addToWaitlist({
      clientName:    name.trim(),
      clientPhone:   phone.trim(),
      clientEmail:   email.trim(),
      serviceId:     String(svc?.id ?? ''),
      serviceName:   svc?.name ?? '',
      preferredDate: date,
      preferredTime: time,
      wantEarlier:   !!wantEarlier,
    })
    setSlotConflict(null)
    setWaitlistJoined(true)
    clearBooking()
    goToStep(4)
  }

  const reset = () => {
    setStep(1)
    setSvc(null)
    setDate('')
    setTime('')
    setError('')
    setDone(null)
    setSlotConflict(null)
    setWaitlistJoined(false)
    setWantNotified(false)
    clearBooking()
  }

  return (
    <div>
      <Hero />
      <Progress step={step} />

      <div className="max-w-3xl mx-auto w-full px-4 py-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <StepService
                services={services}
                selected={svc}
                onSelect={handlePickService}
              />
            )}

            {step === 2 && (
              <>
                <StepDateTime
                  selectedDate={date}
                  selectedTime={time}
                  onPickDate={handlePickDate}
                  onPickTime={setTime}
                  takenSlots={takenSlots}
                  blockedDates={blockedDates}
                  onBack={() => goToStep(1)}
                  service={svc}
                  onChangeService={() => goToStep(1)}
                />
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleContinueDateTime}
                    disabled={!date || !time}
                    className="px-7 py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <StepData
                  booking={{ service: svc, date, time }}
                  name={name}
                  phone={phone}
                  email={email}
                  onName={setName}
                  onPhone={setPhone}
                  onEmail={setEmail}
                  wantNotified={wantNotified}
                  onWantNotified={setWantNotified}
                  error={error}
                  onBack={() => goToStep(2)}
                />
                <button
                  onClick={handleSubmit}
                  className="w-full mt-5 py-4 rounded-xl font-bold text-[13px] uppercase tracking-widest text-white transition-colors"
                  style={{ background: 'var(--color-accent)' }}
                >
                  Confirmar agendamento
                </button>
              </>
            )}

            {step === 4 && waitlistJoined && (
              <WaitlistJoined
                service={svc}
                date={date}
                time={time}
                clientName={name}
                onReset={reset}
              />
            )}

            {step === 4 && done && !waitlistJoined && (
              <StepDone booking={done} onReset={reset} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal de slot ocupado / fila de espera */}
      <WaitlistModal
        slot={slotConflict}
        service={svc}
        name={name}
        phone={phone}
        email={email}
        onClose={() => setSlotConflict(null)}
        onJoin={handleJoinWaitlist}
      />
    </div>
  )
}

// ── Tela de sucesso após entrar na fila de espera ──────────────
function WaitlistJoined({ service, date, time, clientName, onReset }) {
  const fmtBR = iso => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}` }
  return (
    <motion.div
      className="text-center py-10 px-4"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.12, type: 'spring', stiffness: 400, damping: 22 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: 'rgba(255,149,0,0.14)' }}
      >
        <span style={{ fontSize: 36 }}>⏳</span>
      </motion.div>

      <h2 className="font-black text-[20px] uppercase tracking-tight mb-3" style={{ color: '#1D1D1F' }}>
        Você está na fila!
      </h2>
      <p className="text-[13px] max-w-[320px] mx-auto mb-7" style={{ color: 'rgba(60,60,67,0.65)' }}>
        Te avisamos pelo WhatsApp assim que esse horário (ou um anterior) abrir.
      </p>

      <div
        className="bg-white rounded-2xl p-5 max-w-sm mx-auto text-left mb-7"
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.05)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(60,60,67,0.45)' }}>
          Detalhes da fila
        </p>
        <div className="flex flex-col gap-2 text-[13px]">
          {[
            ['Serviço', service?.name],
            ['Data',    fmtBR(date)],
            ['Horário', time],
            ['Nome',    clientName],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between">
              <span style={{ color: 'rgba(60,60,67,0.6)' }}>{l}</span>
              <span className="font-bold" style={{ color: '#1D1D1F' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="px-6 py-3 rounded-xl font-bold text-[13px] uppercase tracking-widest"
        style={{ background: 'var(--color-accent)', color: '#fff' }}
      >
        Tentar outro horário
      </button>
    </motion.div>
  )
}
