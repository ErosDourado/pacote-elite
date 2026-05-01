import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Save, ToggleLeft, ToggleRight, Package, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

const CATEGORIES = ['Cílios', 'Sobrancelhas', 'Nails', 'Skin', 'Outros']
const BLANK = { name: '', category: 'Cílios', price: '', stockQty: '', description: '', imageUrl: '', objectPosition: 'center' }

// Converte File para base64 (persiste após reload)
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const POSITIONS = [
  { v: 'top',    label: 'Topo'   },
  { v: 'center', label: 'Centro' },
  { v: 'bottom', label: 'Base'   },
]

function ImagePicker({ value, position, onChangeImage, onChangePosition }) {
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const b64 = await toBase64(file)
    onChangeImage(b64)
    e.target.value = '' // reset para permitir re-selecionar o mesmo arquivo
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Foto do Produto</span>

      {value ? (
        <div className="relative rounded-2xl overflow-hidden" style={{ height: 150 }}>
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
            style={{ objectPosition: position || 'center' }}
            onError={e => e.target.style.display = 'none'}
          />
          {/* Botão excluir — não abre o seletor de arquivo */}
          <button
            type="button"
            onPointerDown={e => { e.preventDefault(); e.stopPropagation(); onChangeImage('') }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
          >
            <X size={14} strokeWidth={2.5} className="text-white" />
          </button>
          {/* Botão trocar foto */}
          <label className="absolute bottom-2 right-2 cursor-pointer">
            <span className="text-[11px] font-bold text-white px-2 py-1 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
              Trocar foto
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
      ) : (
        <label className="cursor-pointer">
          <div className="h-28 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed"
            style={{ borderColor: 'rgba(120,120,128,0.2)' }}>
            <Upload size={22} strokeWidth={1.5} className="text-label-3" />
            <p className="text-[12px] text-label-2">Toque para selecionar uma foto</p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      )}

      {/* Seletor de posição (só aparece quando há imagem) */}
      {value && (
        <div className="flex gap-2 mt-1">
          {POSITIONS.map(p => (
            <button
              key={p.v}
              type="button"
              onClick={() => onChangePosition(p.v)}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: position === p.v ? 'var(--color-accent)' : 'rgba(120,120,128,0.1)',
                color: position === p.v ? '#fff' : 'rgba(60,60,67,0.6)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

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
            <p className="font-heading text-[18px] font-bold text-label">{initial.id ? 'Editar Produto' : 'Novo Produto'}</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.12)' }}>
              <X size={16} strokeWidth={2} className="text-label-2" />
            </button>
          </div>
          <div className="px-5 flex flex-col gap-4 pb-6">
            <ImagePicker
              value={form.imageUrl}
              position={form.objectPosition || 'center'}
              onChangeImage={v => f('imageUrl', v)}
              onChangePosition={v => f('objectPosition', v)}
            />

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Nome do Produto</span>
              <input className="ios-input" placeholder="Ex: Sérum para Cílios" value={form.name} onChange={e => f('name', e.target.value)} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Descrição</span>
              <textarea
                className="ios-input resize-none"
                placeholder={"Breve descrição\nUse Enter para pular linha"}
                rows={3}
                value={form.description}
                onChange={e => f('description', e.target.value)}
                style={{ lineHeight: '1.5' }}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Preço (R$)</span>
                <input className="ios-input" type="number" placeholder="0,00" value={form.price} onChange={e => f('price', e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Qtd. Estoque</span>
                <input className="ios-input" type="number" placeholder="0" value={form.stockQty} onChange={e => f('stockQty', e.target.value)} />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Categoria</span>
              <select className="ios-input" value={form.category} onChange={e => f('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>

            <button
              onClick={() => onSave({ ...form, price: parseFloat(form.price) || 0, stockQty: parseInt(form.stockQty) || 0 })}
              className="btn-fill w-full mt-1">
              <Save size={15} strokeWidth={2} /> Salvar Produto
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function StockAdmin() {
  const { products, addProduct, removeProduct, updateProduct, toggleStock } = useApp()
  const [modal, setModal] = useState(null)
  const [catFilter, setCatFilter] = useState('Todos')

  const categories = ['Todos', ...new Set(products.map(p => p.category))]
  const filtered   = catFilter === 'Todos' ? products : products.filter(p => p.category === catFilter)

  const handleSave = (data) => {
    if (modal === 'new') addProduct(data)
    else updateProduct(modal.id, data)
    setModal(null)
  }

  return (
    <div className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-label-2">{products.length} produtos</p>
        <button onClick={() => setModal('new')} className="btn-fill py-2 px-4 text-[13px]">
          <Plus size={14} strokeWidth={2} /> Novo Produto
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`chip flex-shrink-0 ${catFilter === c ? 'chip-active' : 'chip-inactive'}`}>
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="ios-card p-10 flex flex-col items-center gap-3 text-center">
          <Package size={32} strokeWidth={1} className="text-label-3" />
          <p className="text-[15px] text-label-2">Nenhum produto nesta categoria</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(prod => (
            <div key={prod.id} className="ios-card p-4 flex items-center gap-3">
              {prod.imageUrl ? (
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-14 h-14 rounded-2xl object-cover flex-shrink-0"
                  style={{ objectPosition: prod.objectPosition || 'center' }}
                  onError={e => e.target.style.display = 'none'}
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, var(--color-bg))' }}>
                  <Package size={20} strokeWidth={1} className="text-accent opacity-50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-label leading-tight truncate">{prod.name}</p>
                <p className="text-[12px] text-label-2">{prod.category}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[13px] font-bold text-accent">R$ {prod.price.toFixed(2).replace('.', ',')}</span>
                  <span className="text-[12px] text-label-2">
                    Estoque: <span className={prod.stockQty === 0 ? 'text-red-400 font-semibold' : 'text-label'}>{prod.stockQty ?? '—'}</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end flex-shrink-0">
                <div className="flex gap-1.5">
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => setModal({ ...prod, price: String(prod.price), stockQty: String(prod.stockQty ?? 0) })}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(120,120,128,0.1)' }}>
                    <Pencil size={13} strokeWidth={1.5} className="text-accent" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => window.confirm('Remover este produto?') && removeProduct(prod.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,59,48,0.08)' }}>
                    <Trash2 size={13} strokeWidth={1.5} style={{ color: '#FF3B30' }} />
                  </motion.button>
                </div>
                <button onClick={() => toggleStock(prod.id)} title="Alternar disponibilidade">
                  {prod.inStock
                    ? <ToggleRight size={26} strokeWidth={1.5} className="text-accent" />
                    : <ToggleLeft  size={26} strokeWidth={1.5} className="text-label-3" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ProductModal
          initial={modal === 'new' ? BLANK : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
