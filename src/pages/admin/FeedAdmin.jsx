import { useState } from 'react'
import { Plus, Trash2, Pencil, X, Image, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

const BLANK = { imageUrl: '', title: '', procedure: '', description: '', serviceId: '' }

function PostModal({ initial, onSave, onClose }) {
  const { services } = useApp()
  const [form, setForm] = useState({ ...BLANK, ...initial })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const canSave = form.title.trim().length >= 2
  const isEdit = !!initial?.id

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
            <p className="font-heading text-[18px] font-bold text-label">
              {isEdit ? 'Editar Post' : 'Nova Postagem'}
            </p>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(120,120,128,0.12)' }}>
              <X size={16} strokeWidth={2} className="text-label-2" />
            </button>
          </div>

          <div className="px-5 flex flex-col gap-4 pb-6">
            {/* Preview */}
            {form.imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden" style={{ height: 180 }}>
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover"
                  onError={e => e.target.style.display='none'} />
                <button onClick={() => f('imageUrl', '')}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center">
                  <X size={14} strokeWidth={2} className="text-white" />
                </button>
              </div>
            ) : (
              <div className="h-32 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed"
                style={{ borderColor: 'rgba(120,120,128,0.2)' }}>
                <Image size={24} strokeWidth={1} className="text-label-3" />
                <p className="text-[12px] text-label-2">Cole a URL da imagem abaixo</p>
              </div>
            )}

            {[
              { k: 'imageUrl',    l: 'URL da Imagem',  ph: 'https://...' },
              { k: 'title',       l: 'Título *',        ph: 'Título da postagem' },
              { k: 'procedure',   l: 'Procedimento',    ph: 'Ex: Volume Russo, Nail Art' },
              { k: 'description', l: 'Descrição',        ph: 'Texto opcional de apoio' },
            ].map(fi => (
              <label key={fi.k} className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">{fi.l}</span>
                <input className="ios-input" placeholder={fi.ph} value={form[fi.k]}
                  onChange={e => f(fi.k, e.target.value)} />
              </label>
            ))}

            {/* Serviço vinculado */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Serviço Vinculado</span>
              <select className="ios-input" value={form.serviceId} onChange={e => f('serviceId', e.target.value)}>
                <option value="">— Nenhum —</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>

            <button
              onClick={() => canSave && onSave(form)}
              disabled={!canSave}
              className="btn-fill w-full mt-1"
              style={{ opacity: canSave ? 1 : 0.5 }}
            >
              <Save size={15} strokeWidth={2} />
              {isEdit ? 'Salvar Edição' : 'Publicar no Feed'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function FeedAdmin() {
  const { feedPosts, addFeedPost, removeFeedPost, updateFeedPost } = useApp()
  const [modal, setModal] = useState(null) // null | 'new' | post object

  const fmt = iso => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })

  const handleSave = (data) => {
    if (modal === 'new') addFeedPost(data)
    else updateFeedPost(modal.id, data)
    setModal(null)
  }

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-label-2">{feedPosts.length} postagens publicadas</p>
        <button onClick={() => setModal('new')} className="btn-fill py-2 px-4 text-[13px]">
          <Plus size={14} strokeWidth={2} /> Nova Postagem
        </button>
      </div>

      {feedPosts.length === 0 ? (
        <div className="ios-card p-10 flex flex-col items-center gap-3 text-center">
          <Image size={32} strokeWidth={1} className="text-label-3" />
          <p className="text-[15px] text-label-2">Nenhuma postagem ainda</p>
          <button onClick={() => setModal('new')} className="btn-tint text-[14px] py-2.5 px-5">
            Criar primeira postagem
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feedPosts.map(post => (
            <div key={post.id} className="ios-card overflow-hidden">
              {post.imageUrl && (
                <img src={post.imageUrl} alt={post.title} className="w-full object-cover" style={{ height: 160 }} />
              )}
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-label leading-tight">{post.title}</p>
                  {post.procedure && (
                    <p className="text-[12px] font-medium mt-0.5" style={{ color: 'var(--color-accent)' }}>
                      {post.procedure}
                    </p>
                  )}
                  {post.description && (
                    <p className="text-[13px] text-label-2 mt-1 line-clamp-2">{post.description}</p>
                  )}
                  <p className="text-[11px] text-label-3 mt-2 uppercase tracking-wide">{fmt(post.createdAt)}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => setModal({ ...post, serviceId: post.serviceId ?? '' })}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(120,120,128,0.1)' }}>
                    <Pencil size={13} strokeWidth={1.5} className="text-accent" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => window.confirm('Remover esta postagem?') && removeFeedPost(post.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,59,48,0.08)' }}>
                    <Trash2 size={14} strokeWidth={1.5} style={{ color: '#FF3B30' }} />
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <PostModal
          initial={modal === 'new' ? BLANK : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
