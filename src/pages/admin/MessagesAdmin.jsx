import { useState, useEffect } from 'react'
import { Save, AlertCircle, MessageSquare, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  subscribeTemplates,
  updateTemplate,
  DEFAULT_TEMPLATES,
} from '../../services/templatesService'
import { isFirebaseConfigured } from '../../firebase'

const STATUS_LIST = [
  { id: 'pending',   label: 'Pendente',   color: '#FF9500', desc: 'Enviada quando uma cliente faz um pedido novo de agendamento' },
  { id: 'confirmed', label: 'Confirmado', color: '#34C759', desc: 'Enviada quando o admin confirma o agendamento' },
  { id: 'concluded', label: 'Concluído',  color: '#8E8E93', desc: 'Enviada após o atendimento ser realizado' },
  { id: 'cancelled', label: 'Cancelado',  color: '#FF3B30', desc: 'Enviada quando o agendamento é cancelado' },
  { id: 'waitlist',  label: 'Fila de Espera', color: 'var(--color-accent)', desc: 'Enviada para clientes na fila quando abre uma vaga' },
]

const VARIABLES = [
  { tag: '{nome}',    desc: 'Nome do cliente'   },
  { tag: '{servico}', desc: 'Nome do serviço'   },
  { tag: '{data}',    desc: 'Data do agendamento' },
  { tag: '{hora}',    desc: 'Horário'           },
]

export default function MessagesAdmin() {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES)
  const [drafts,    setDrafts]    = useState(DEFAULT_TEMPLATES)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [savingKey, setSavingKey] = useState(null)
  const [savedKey,  setSavedKey]  = useState(null)

  const configured = isFirebaseConfigured()

  // Subscribe em tempo real
  useEffect(() => {
    if (!configured) {
      setError('Firebase não configurado. Verifique o arquivo .env.local')
      setLoading(false)
      return
    }
    const unsubscribe = subscribeTemplates(
      data => {
        setTemplates(data)
        // Só sobrescreve drafts se ele ainda não foi editado
        setDrafts(prev => {
          const next = { ...prev }
          STATUS_LIST.forEach(s => {
            if (!prev[s.id] || prev[s.id] === templates[s.id]) {
              next[s.id] = data[s.id] || ''
            }
          })
          return next
        })
        setLoading(false)
        setError(null)
      },
      err => {
        setError(err.message || 'Erro ao carregar templates')
        setLoading(false)
      }
    )
    return () => unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured])

  const handleSave = async (statusId) => {
    setSavingKey(statusId)
    setSavedKey(null)
    try {
      await updateTemplate(statusId, drafts[statusId])
      setSavedKey(statusId)
      setTimeout(() => setSavedKey(k => (k === statusId ? null : k)), 1800)
    } catch (e) {
      window.alert('Erro ao salvar: ' + (e.message || e))
    } finally {
      setSavingKey(null)
    }
  }

  if (error) {
    return (
      <div className="px-4 pt-5">
        <div className="ios-card p-6 flex flex-col items-center gap-3 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,59,48,0.12)' }}
          >
            <AlertCircle size={20} strokeWidth={1.75} style={{ color: '#FF3B30' }} />
          </div>
          <p className="text-[14px] font-semibold text-label">Erro ao conectar</p>
          <p className="text-[12px] text-label-2 max-w-xs">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-5 pb-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' }}
        >
          <MessageSquare size={18} strokeWidth={1.75} className="text-accent" />
        </div>
        <div>
          <p className="font-heading text-[16px] font-bold text-label">Templates de WhatsApp</p>
          <p className="text-[11px] text-label-2 mt-0.5">Mensagens automáticas para cada status</p>
        </div>
      </div>

      {/* Variáveis disponíveis */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{ background: 'rgba(120,120,128,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(60,60,67,0.55)' }}>
          Variáveis disponíveis
        </p>
        <div className="flex flex-wrap gap-2">
          {VARIABLES.map(v => (
            <div
              key={v.tag}
              className="inline-flex flex-col gap-0.5 px-2.5 py-1.5 rounded-lg"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)' }}
            >
              <code className="text-[11px] font-bold text-accent">{v.tag}</code>
              <span className="text-[10px]" style={{ color: 'rgba(60,60,67,0.55)' }}>{v.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Templates */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(120,120,128,0.05)' }}>
              <div className="h-3 w-1/4 rounded-md mb-3" style={{ background: 'rgba(120,120,128,0.12)' }} />
              <div className="h-16 rounded-md" style={{ background: 'rgba(120,120,128,0.08)' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {STATUS_LIST.map(s => {
            const value = drafts[s.id] ?? ''
            const isDirty = value !== (templates[s.id] || DEFAULT_TEMPLATES[s.id])
            const isSaving = savingKey === s.id
            const isSaved  = savedKey === s.id
            return (
              <div
                key={s.id}
                className="rounded-2xl p-4 bg-white"
                style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                {/* Header do template */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: s.color }}
                    />
                    <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: s.color }}>
                      {s.label}
                    </p>
                  </div>
                  <AnimatePresence>
                    {isSaved && (
                      <motion.span
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                        style={{ color: '#34C759' }}
                      >
                        <Check size={11} strokeWidth={2.5} /> Salvo
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <p className="text-[11px] mb-3" style={{ color: 'rgba(60,60,67,0.55)' }}>
                  {s.desc}
                </p>

                <textarea
                  rows={3}
                  value={value}
                  onChange={e => setDrafts(p => ({ ...p, [s.id]: e.target.value }))}
                  className="w-full rounded-xl px-3 py-2.5 text-[13px] focus:outline-none resize-none transition-colors"
                  style={{ border: '1px solid rgba(60,60,67,0.18)', background: 'white' }}
                />

                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleSave(s.id)}
                    disabled={!isDirty || isSaving}
                    className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest text-white transition-all flex items-center gap-1.5"
                    style={{
                      background: isDirty ? 'var(--color-accent)' : 'rgba(120,120,128,0.2)',
                      opacity: isSaving ? 0.7 : 1,
                      cursor: !isDirty || isSaving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Save size={12} strokeWidth={2.5} />
                    {isSaving ? 'Salvando…' : 'Salvar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
