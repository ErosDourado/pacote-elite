import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Save, X, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SERVICE_ICONS, SERVICE_ICON_KEYS, SERVICE_ICON_LABELS,
  DEFAULT_SERVICE_ICON, getServiceIcon,
} from '../../components/ServiceIcons'
import {
  subscribeServices,
  createService,
  updateService,
  deleteService,
} from '../../services/servicesService'
import { isFirebaseConfigured } from '../../firebase'

const CATEGORIES = ['Lash', 'Sobrancelhas', 'Nails', 'Skin', 'Outros']

const BLANK = {
  name: '',
  category: 'Lash',
  price: '',
  duration: '',
  description: '',
  icon: DEFAULT_SERVICE_ICON,
}

// Galeria de ícones (3 SVGs do nicho)
function IconPickerGrid({ value, onChange }) {
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(60,60,67,0.5)' }}>
        Ícone do Serviço
      </span>
      <div className="grid grid-cols-3 gap-2">
        {SERVICE_ICON_KEYS.map(key => {
          const Icon = SERVICE_ICONS[key]
          const active = value === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl transition-all"
              style={{
                background: active
                  ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)'
                  : 'rgba(120,120,128,0.06)',
                border: `1.5px solid ${active ? 'var(--color-accent)' : 'transparent'}`,
              }}
              aria-label={SERVICE_ICON_LABELS[key]}
            >
              <Icon size={28} style={{ color: active ? 'var(--color-accent)' : 'rgba(60,60,67,0.55)' }} />
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: active ? 'var(--color-accent)' : 'rgba(60,60,67,0.55)' }}
              >
                {SERVICE_ICON_LABELS[key]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Modal de criação/edição (controlled) ─────────────────────────
function ServiceModal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState({ ...BLANK, ...initial, icon: initial.icon || DEFAULT_SERVICE_ICON })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const SelectedIcon = getServiceIcon(form.icon)

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-md z-10 max-h-[92dvh] overflow-y-auto pb-safe"
          style={{ background: 'var(--color-surface)', borderRadius: '28px 28px 0 0' }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onClick={e => e.stopPropagation()}>
          <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />
          <div className="px-5 flex items-center justify-between mb-5">
            <p className="font-heading text-[18px] font-bold text-label">{initial.id ? 'Editar Serviço' : 'Novo Serviço'}</p>
            <button onClick={onClose} disabled={saving} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.12)' }}>
              <X size={16} strokeWidth={2} className="text-label-2" />
            </button>
          </div>

          <div className="px-5 flex flex-col gap-4 pb-6">
            {/* Preview do ícone */}
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'rgba(120,120,128,0.05)' }}>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' }}
              >
                <SelectedIcon size={24} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(60,60,67,0.4)' }}>Ícone</p>
                <p className="text-[14px] font-semibold text-label">{SERVICE_ICON_LABELS[form.icon] ?? form.icon}</p>
              </div>
            </div>

            <IconPickerGrid value={form.icon} onChange={v => f('icon', v)} />

            {[
              { k: 'name',        l: 'Nome do Serviço', ph: 'Ex: Extensão Fio a Fio' },
              { k: 'description', l: 'Descrição',        ph: 'Breve descrição' },
            ].map(fi => (
              <label key={fi.k} className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">{fi.l}</span>
                <input className="ios-input" placeholder={fi.ph} value={form[fi.k]} onChange={e => f(fi.k, e.target.value)} />
              </label>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Preço (R$)</span>
                <input className="ios-input" type="number" placeholder="0,00" value={form.price} onChange={e => f('price', e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Duração (min)</span>
                <input className="ios-input" type="number" placeholder="60" value={form.duration} onChange={e => f('duration', e.target.value)} />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Categoria</span>
              <select className="ios-input" value={form.category} onChange={e => f('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>

            <button
              disabled={saving || !form.name.trim()}
              onClick={() => onSave({
                ...form,
                price: parseFloat(form.price) || 0,
                duration: parseInt(form.duration) || 60,
              })}
              className="btn-fill w-full mt-1"
              style={{ opacity: saving || !form.name.trim() ? 0.6 : 1 }}
            >
              <Save size={15} strokeWidth={2} /> {saving ? 'Salvando…' : 'Salvar Serviço'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Página principal — conectada ao Firestore ─────────────────────
export default function ServicesAdmin() {
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [modal,    setModal]    = useState(null)
  const [saving,   setSaving]   = useState(false)

  // Firebase configurado?
  const configured = isFirebaseConfigured()

  // Subscribe em tempo real ao Firestore
  useEffect(() => {
    if (!configured) {
      setError('Firebase não configurado. Verifique o arquivo .env.local')
      setLoading(false)
      return
    }
    const unsubscribe = subscribeServices(
      items => {
        setServices(items)
        setLoading(false)
        setError(null)
      },
      err => {
        setError(err.message || 'Erro ao carregar serviços do Firestore')
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [configured])

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (modal === 'new') {
        await createService(data)
      } else {
        await updateService(modal.id, data)
      }
      setModal(null)
    } catch (e) {
      window.alert('Erro ao salvar: ' + (e.message || e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (svc) => {
    if (!window.confirm(`Remover "${svc.name}"?`)) return
    try {
      await deleteService(svc.id)
    } catch (e) {
      window.alert('Erro ao remover: ' + (e.message || e))
    }
  }

  // ── Estados visuais ─────────────────────────────────────────────
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
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-label-2">
          {loading ? 'Carregando…' : `${services.length} serviço${services.length !== 1 ? 's' : ''}`}
        </p>
        <button onClick={() => setModal('new')} className="btn-fill py-2 px-4 text-[13px]">
          <Plus size={14} strokeWidth={2} /> Novo Serviço
        </button>
      </div>

      {loading ? (
        <div className="ios-section">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: i < 2 ? '0.33px solid rgba(60,60,67,0.12)' : 'none' }}>
              <div className="w-11 h-11 rounded-xl flex-shrink-0" style={{ background: 'rgba(120,120,128,0.08)' }} />
              <div className="flex-1">
                <div className="h-3 w-2/3 rounded-md mb-1.5" style={{ background: 'rgba(120,120,128,0.1)' }} />
                <div className="h-2.5 w-1/3 rounded-md" style={{ background: 'rgba(120,120,128,0.08)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="ios-card p-10 flex flex-col items-center gap-3 text-center">
          <p className="text-[15px] text-label-2">Nenhum serviço cadastrado ainda</p>
          <button onClick={() => setModal('new')} className="btn-tint mt-2">
            <Plus size={14} strokeWidth={2} /> Criar primeiro serviço
          </button>
        </div>
      ) : (
        <div className="ios-section">
          {services.map((svc, i) => {
            const Icon = getServiceIcon(svc.icon)
            return (
              <div key={svc.id} className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < services.length - 1 ? '0.33px solid rgba(60,60,67,0.12)' : 'none' }}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' }}
                >
                  <Icon size={18} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-label leading-tight truncate">{svc.name}</p>
                  <p className="text-[12px] text-label-2">{svc.category} · {svc.duration}min</p>
                  <p className="text-[13px] font-bold text-accent">R$ {svc.price}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => setModal({
                      ...svc,
                      price: String(svc.price ?? ''),
                      duration: String(svc.duration ?? ''),
                    })}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(120,120,128,0.1)' }}>
                    <Pencil size={14} strokeWidth={1.5} className="text-accent" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => handleDelete(svc)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,59,48,0.08)' }}>
                    <Trash2 size={14} strokeWidth={1.5} style={{ color: '#FF3B30' }} />
                  </motion.button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <ServiceModal
          initial={modal === 'new' ? BLANK : modal}
          onSave={handleSave}
          onClose={() => !saving && setModal(null)}
          saving={saving}
        />
      )}
    </div>
  )
}
