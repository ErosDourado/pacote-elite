import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Save, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

const BLANK = { url: '', title: '', subtitle: '' }

function BannerModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...BLANK, ...initial })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const canSave = form.url.trim().length > 0 && form.title.trim().length > 0

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-md z-10 max-h-[92dvh] overflow-y-auto pb-safe"
          style={{ background: 'var(--color-surface)', borderRadius: '28px 28px 0 0' }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onClick={e => e.stopPropagation()}>
          <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />
          <div className="px-5 flex items-center justify-between mb-5">
            <p className="font-heading text-[18px] font-bold text-label">
              {initial?.id ? 'Editar Banner' : 'Novo Banner'}
            </p>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(120,120,128,0.12)' }}>
              <X size={16} strokeWidth={2} className="text-label-2" />
            </button>
          </div>

          <div className="px-5 flex flex-col gap-4 pb-6">
            {/* Preview */}
            {form.url ? (
              <div className="relative rounded-2xl overflow-hidden" style={{ height: 160 }}>
                <img src={form.url} alt="preview" className="w-full h-full object-cover"
                  onError={e => e.target.style.display = 'none'} />
              </div>
            ) : (
              <div className="h-32 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed"
                style={{ borderColor: 'rgba(120,120,128,0.2)' }}>
                <Layers size={24} strokeWidth={1} className="text-label-3" />
                <p className="text-[12px] text-label-2">Cole a URL da imagem abaixo</p>
              </div>
            )}

            {[
              { k: 'url',      l: 'URL da Imagem *', ph: 'https://...' },
              { k: 'title',    l: 'Título *',         ph: 'Ex: Realce sua beleza natural' },
              { k: 'subtitle', l: 'Subtítulo',         ph: 'Texto complementar do banner' },
            ].map(fi => (
              <label key={fi.k} className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">{fi.l}</span>
                <input className="ios-input" placeholder={fi.ph} value={form[fi.k]}
                  onChange={e => f(fi.k, e.target.value)} />
              </label>
            ))}

            <button
              onClick={() => canSave && onSave(form)}
              disabled={!canSave}
              className="btn-fill w-full mt-1"
              style={{ opacity: canSave ? 1 : 0.5 }}
            >
              <Save size={15} strokeWidth={2} /> Salvar Banner
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function BannersAdmin() {
  const { banners, addBanner, removeBanner, updateBanner } = useApp()
  const [modal, setModal] = useState(null) // null | 'new' | banner object

  const handleSave = (data) => {
    if (modal === 'new') addBanner(data)
    else updateBanner(modal.id, data)
    setModal(null)
  }

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-label-2">{banners.length} banner{banners.length !== 1 ? 's' : ''} ativos</p>
        <button onClick={() => setModal('new')} className="btn-fill py-2 px-4 text-[13px]">
          <Plus size={14} strokeWidth={2} /> Novo Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="ios-card p-10 flex flex-col items-center gap-3 text-center">
          <Layers size={32} strokeWidth={1} className="text-label-3" />
          <p className="text-[15px] text-label-2">Nenhum banner cadastrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {banners.map(banner => (
            <div key={banner.id} className="ios-card overflow-hidden">
              {banner.url && (
                <img src={banner.url} alt={banner.title} className="w-full object-cover" style={{ height: 140 }} />
              )}
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-label leading-tight truncate">{banner.title}</p>
                  {banner.subtitle && (
                    <p className="text-[13px] text-label-2 mt-0.5 line-clamp-1">{banner.subtitle}</p>
                  )}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => setModal({ ...banner })}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(120,120,128,0.1)' }}>
                    <Pencil size={13} strokeWidth={1.5} className="text-accent" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => window.confirm('Remover este banner?') && removeBanner(banner.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,59,48,0.08)' }}>
                    <Trash2 size={13} strokeWidth={1.5} style={{ color: '#FF3B30' }} />
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <BannerModal
          initial={modal === 'new' ? BLANK : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
