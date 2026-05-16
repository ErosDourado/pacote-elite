import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Save, Layers, Smartphone, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import ImageUploader from '../../components/ImageUploader'

const BLANK = { url: '', urlDesktop: '', title: '', subtitle: '' }

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

          <div className="px-5 flex flex-col gap-5 pb-6">

            {/* Imagem Mobile */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Smartphone size={13} strokeWidth={2} className="text-accent" />
                  <span className="text-[12px] font-semibold text-label uppercase tracking-wide">Imagem Mobile *</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>
                  Canva: 1080 × 720 px
                </span>
              </div>
              <ImageUploader
                label=""
                value={form.url}
                position={form.objectPosition}
                onChangeImage={v => f('url', v)}
                onChangePosition={v => f('objectPosition', v)}
                height={140}
              />
            </div>

            {/* Imagem Desktop */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Monitor size={13} strokeWidth={2} className="text-label-2" />
                  <span className="text-[12px] font-semibold text-label uppercase tracking-wide">Imagem Desktop</span>
                  <span className="text-[10px] text-label-3">(opcional)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(120,120,128,0.10)', color: 'rgba(60,60,67,0.6)' }}>
                  Canva: 1500 × 500 px
                </span>
              </div>
              <ImageUploader
                label=""
                value={form.urlDesktop}
                position={form.objectPositionDesktop}
                onChangeImage={v => f('urlDesktop', v)}
                onChangePosition={v => f('objectPositionDesktop', v)}
                height={100}
              />
              {!form.urlDesktop && (
                <p className="text-[11px] text-label-3">
                  Se não adicionar, a imagem mobile será usada no desktop também.
                </p>
              )}
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Título *</span>
              <input className="ios-input" placeholder="Ex: Realce sua beleza natural"
                value={form.title} onChange={e => f('title', e.target.value)} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Subtítulo</span>
              <input className="ios-input" placeholder="Texto complementar do banner"
                value={form.subtitle} onChange={e => f('subtitle', e.target.value)} />
            </label>

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
  const { banners, addBanner, removeBanner, updateBanner, resolveImage } = useApp()
  const [modal, setModal] = useState(null)

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
              {banner.url && resolveImage(banner.url) && (
                <img src={resolveImage(banner.url)} alt={banner.title}
                  className="w-full object-cover" style={{ height: 120 }} />
              )}
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-label leading-tight truncate">{banner.title}</p>
                  {banner.subtitle && (
                    <p className="text-[13px] text-label-2 mt-0.5 line-clamp-1">{banner.subtitle}</p>
                  )}
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-[10px] flex items-center gap-1 text-label-3">
                      <Smartphone size={9} /> Mobile {banner.url ? '✓' : '—'}
                    </span>
                    <span className="text-[10px] flex items-center gap-1 text-label-3">
                      <Monitor size={9} /> Desktop {banner.urlDesktop ? '✓' : '(usa mobile)'}
                    </span>
                  </div>
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
