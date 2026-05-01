import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { signIn, signUp, friendlyAuthError } from '../services/authService'
import { themeConfig } from '../themeConfig'

export default function Login({ onNavigate, pageState }) {
  const [mode,    setMode]    = useState('login') // 'login' | 'signup'
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // Pra onde voltar após login (admin / finance / home)
  const redirectTo = pageState?.redirectTo || 'home'

  const isSignup = mode === 'signup'
  const canSubmit =
    email.trim().length > 3 &&
    pass.length >= 6 &&
    (!isSignup || name.trim().length >= 2)

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!canSubmit || loading) return
    setLoading(true)
    setError('')
    try {
      if (isSignup) {
        await signUp(email.trim(), pass, name.trim())
      } else {
        await signIn(email.trim(), pass)
      }
      // O AppContext detecta o login via observeAuth e atualiza isAdmin.
      // A gente redireciona pra rota original (ou home).
      onNavigate(redirectTo)
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo / título */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' }}
          >
            <Lock size={26} strokeWidth={1.75} className="text-accent" />
          </div>
          <h1 className="font-heading text-[24px] font-black uppercase tracking-tight text-label">
            {isSignup ? 'Criar conta' : 'Entrar'}
          </h1>
          <p className="text-[13px] text-label-2 mt-1">
            {isSignup
              ? `Cadastre-se em ${themeConfig.appName}`
              : 'Bem-vinda de volta'}
          </p>
        </div>

        {/* Card do form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 flex flex-col gap-3"
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.05)' }}
        >
          {/* Nome (signup) */}
          <AnimatePresence initial={false}>
            {isSignup && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden' }}
              >
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(60,60,67,0.55)' }}>
                    Nome
                  </span>
                  <div className="relative">
                    <User size={14} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Seu nome"
                      autoComplete="name"
                      className="w-full rounded-xl px-4 py-3 pl-9 text-[14px] focus:outline-none transition-colors"
                      style={{ border: '1px solid rgba(60,60,67,0.18)' }}
                    />
                  </div>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(60,60,67,0.55)' }}>
              E-mail
            </span>
            <div className="relative">
              <Mail size={14} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full rounded-xl px-4 py-3 pl-9 text-[14px] focus:outline-none transition-colors"
                style={{ border: '1px solid rgba(60,60,67,0.18)' }}
              />
            </div>
          </label>

          {/* Senha */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(60,60,67,0.55)' }}>
              Senha
            </span>
            <div className="relative">
              <Lock size={14} strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-3" />
              <input
                type={showPw ? 'text' : 'password'}
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                className="w-full rounded-xl px-4 py-3 pl-9 pr-10 text-[14px] focus:outline-none transition-colors"
                style={{ border: '1px solid rgba(60,60,67,0.18)' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                tabIndex={-1}
              >
                {showPw
                  ? <EyeOff size={15} strokeWidth={1.75} className="text-label-3" />
                  : <Eye size={15} strokeWidth={1.75} className="text-label-3" />}
              </button>
            </div>
          </label>

          {/* Erro */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium"
                style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30' }}
              >
                <AlertCircle size={13} strokeWidth={2} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botão principal */}
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-[13px] uppercase tracking-widest text-white transition-all"
            style={{
              background: 'var(--color-accent)',
              opacity: !canSubmit || loading ? 0.5 : 1,
              cursor: !canSubmit || loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? 'Aguarde…'
              : <>{isSignup ? 'Criar conta' : 'Entrar'} <ArrowRight size={14} strokeWidth={2.5} /></>}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="text-center mt-6">
          <p className="text-[13px] text-label-2">
            {isSignup ? 'Já tem conta?' : 'Ainda não tem conta?'}{' '}
            <button
              onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError('') }}
              className="font-bold text-accent"
            >
              {isSignup ? 'Entrar' : 'Criar conta'}
            </button>
          </p>
        </div>

        {/* Voltar pra home */}
        <div className="text-center mt-4">
          <button
            onClick={() => onNavigate('home')}
            className="text-[12px] text-label-3 font-medium"
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    </div>
  )
}
