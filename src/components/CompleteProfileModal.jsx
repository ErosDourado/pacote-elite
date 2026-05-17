import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, Cake, ArrowRight, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'

// Modal bloqueante exibido quando o usuário logado tem cadastro incompleto.
// Pede nome, telefone e/ou aniversário — apenas os campos faltantes.
export default function CompleteProfileModal() {
  const { currentUser, usuarios, profile, setProfile, dataLoaded, firebaseOn } = useApp()

  // Busca o doc do usuário atual em `usuarios` pelo email
  const myDoc = useMemo(() => {
    const email = (currentUser?.email || '').trim().toLowerCase()
    if (!email) return null
    return usuarios.find(u => (u.email || '').trim().toLowerCase() === email) || null
  }, [usuarios, currentUser])

  // Determina o que está faltando, combinando dados do Firestore com profile local
  const missing = useMemo(() => {
    if (!currentUser || !firebaseOn || !dataLoaded) return null
    const name     = (myDoc?.name     || profile.name     || currentUser.displayName || '').trim()
    const phone    = (myDoc?.phone    || profile.phone    || '').replace(/\D/g, '')
    const birthday = (myDoc?.birthday || profile.birthday || '').trim()
    const out = []
    if (!name)               out.push('name')
    if (phone.length < 10)   out.push('phone')
    if (!birthday)           out.push('birthday')
    return out
  }, [myDoc, profile, currentUser, firebaseOn, dataLoaded])

  const open = !!(missing && missing.length > 0)

  // Form local
  const [name, setName]         = useState('')
  const [phoneIn, setPhoneIn]   = useState('')
  const [birthdayIn, setBirthdayIn] = useState('')
  const [saving, setSaving]     = useState(false)

  // Hidrata o form com o que JÁ existe
  useEffect(() => {
    if (!open) return
    setName(myDoc?.name || profile.name || currentUser?.displayName || '')
    setPhoneIn(formatPhone(myDoc?.phone || profile.phone || ''))
    setBirthdayIn(myDoc?.birthday || profile.birthday || '')
  }, [open, myDoc, profile, currentUser])

  const phoneDigits = phoneIn.replace(/\D/g, '')
  const birthdayValid = (() => {
    if (!birthdayIn) return false
    const d = new Date(birthdayIn + 'T12:00:00')
    return !isNaN(d.getTime()) && d < new Date() && d.getFullYear() > 1900
  })()
  const canSave =
    name.trim().length >= 2 &&
    phoneDigits.length >= 10 &&
    birthdayValid

  const handleSave = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      setProfile({
        name: name.trim(),
        phone: phoneDigits,
        email: currentUser?.email || profile.email || '',
        birthday: birthdayIn,
      })
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />

        <motion.div
          className="relative w-full max-w-md z-10 rounded-3xl p-6"
          style={{ background: 'var(--color-surface)' }}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        >
          <div className="flex flex-col items-center text-center mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' }}
            >
              <Sparkles size={22} strokeWidth={1.75} className="text-accent" />
            </div>
            <p className="font-heading text-[20px] font-bold text-label">Complete seu cadastro</p>
            <p className="text-[13px] text-label-2 mt-1 leading-snug">
              Pra continuar usando o app, precisamos de algumas informações.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(60,60,67,0.55)' }}>
                Nome completo
              </span>
              <div className="relative">
                <User size={14} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-xl px-4 py-3 pl-9 text-[14px] focus:outline-none"
                  style={{ border: '1px solid rgba(60,60,67,0.18)' }}
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(60,60,67,0.55)' }}>
                WhatsApp
              </span>
              <div className="relative">
                <Phone size={14} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneIn}
                  onChange={e => setPhoneIn(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-xl px-4 py-3 pl-9 text-[14px] focus:outline-none"
                  style={{ border: '1px solid rgba(60,60,67,0.18)' }}
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(60,60,67,0.55)' }}>
                Aniversário
              </span>
              <div className="relative">
                <Cake size={14} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
                <input
                  type="date"
                  value={birthdayIn}
                  onChange={e => setBirthdayIn(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl px-4 py-3 pl-9 text-[14px] focus:outline-none"
                  style={{ border: '1px solid rgba(60,60,67,0.18)' }}
                />
              </div>
            </label>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saving}
            className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-widest text-white transition-all"
            style={{
              background: 'var(--color-accent)',
              opacity: !canSave || saving ? 0.5 : 1,
              cursor: !canSave || saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Salvando…' : <>Salvar e continuar <ArrowRight size={14} strokeWidth={2.5} /></>}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function formatPhone(raw) {
  const d = String(raw || '').replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2)  return d
  if (d.length <= 6)  return `(${d.slice(0,2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}
