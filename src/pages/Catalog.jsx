import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Package, ChevronRight, Store, Check } from 'lucide-react'
import { brandConfig } from '../brandConfig'
import { useApp } from '../context/AppContext'

// ── Bottom Sheet de produto ───────────────────────────────────────
function ProductSheet({ product, onClose }) {
  const { addToCart, resolveImage } = useApp()
  const [added, setAdded] = useState(false)
  if (!product) return null

  const handleAdd = () => {
    addToCart(product, 'store')
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 1200)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <motion.div
          className="relative w-full max-w-md z-10"
          style={{ background: 'var(--color-surface)', borderRadius: '28px 28px 0 0' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Foto grande */}
          {product.imageUrl && (
            <div className="relative overflow-hidden" style={{ height: 260, borderRadius: '28px 28px 0 0' }}>
              <img src={resolveImage(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-sm"
              >
                <X size={16} strokeWidth={2} className="text-white" />
              </button>
            </div>
          )}

          <div className="p-5 pb-safe">
            {!product.imageUrl && (
              <div className="flex justify-between items-center mb-4">
                <div className="w-9 h-1 rounded-full bg-gray-200 mx-auto" />
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.12)' }}>
                  <X size={16} strokeWidth={2} className="text-label" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 pr-3">
                <span className="badge-pill mb-1.5">{product.category}</span>
                <h2 className="font-heading text-[20px] font-bold text-label tracking-tight mt-1 leading-tight">
                  {product.name}
                </h2>
              </div>
              <span className="font-heading text-[22px] font-bold text-accent flex-shrink-0">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <p className="text-[15px] text-label-2 leading-relaxed mb-5 whitespace-pre-wrap">{product.description}</p>

            {product.inStock ? (
              <button
                onClick={handleAdd}
                className="btn-fill w-full"
                style={added ? { background: '#34C759' } : {}}
              >
                {added
                  ? <><Check size={15} strokeWidth={2.5} /> Adicionado!</>
                  : <><Store size={15} strokeWidth={2} /> Retirar na loja</>}
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 text-label-2 text-[14px]">
                <Package size={16} strokeWidth={1.5} />
                Produto temporariamente indisponível
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Card de produto (boutique style) ─────────────────────────────
function ProductCard({ product, onClick }) {
  const { resolveImage } = useApp()
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(product)}
      className="ios-card overflow-hidden cursor-pointer"
      style={{ opacity: product.inStock ? 1 : 0.55 }}
    >
      {/* Foto full-width */}
      <div className="relative" style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
        {product.imageUrl
          ? <img src={resolveImage(product.imageUrl)} alt={product.name} className="w-full h-full object-cover transition-transform duration-300"
              style={{ objectPosition: product.objectPosition || 'center' }} />
          : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, var(--color-bg))' }}>
              <Package size={32} strokeWidth={1} className="text-accent opacity-40" />
            </div>
          )
        }

        {/* Badge categoria */}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
            {product.category}
          </span>
        </div>

        {/* Esgotado */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(2px)' }}>
            <span className="text-[12px] font-semibold text-label px-3 py-1 rounded-full bg-white shadow-sm">
              Esgotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[13px] font-semibold text-label leading-tight line-clamp-2">{product.name}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[14px] font-bold text-accent">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          {product.inStock && (
            <span className="text-[10px] text-label-2 flex items-center gap-0.5">
              <MessageCircle size={10} strokeWidth={1.5} /> WhatsApp
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Página Catálogo ───────────────────────────────────────────────
export default function Catalog() {
  const { products } = useApp()
  const [active, setActive] = useState(null)
  const [cat, setCat]       = useState('Todos')

  const categories = ['Todos', ...new Set(products.map(p => p.category))]
  const filtered   = cat === 'Todos' ? products : products.filter(p => p.category === cat)

  return (
    <>
      <div>
        {/* Container principal — boutique compacta no desktop */}
        <div className="max-w-3xl mx-auto w-full">

          {/* Header desktop com título (visível só em telas grandes) */}
          <div className="hidden md:block px-6 pt-8 pb-2">
            <h1 className="font-heading text-[28px] font-bold text-label tracking-tight">Loja</h1>
            <p className="text-[14px] text-label-2 mt-1">Produtos selecionados para você</p>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 md:px-6 pt-4 pb-4">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`chip flex-shrink-0 ${cat === c ? 'chip-active' : 'chip-inactive'}`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid responsivo — 2 cols mobile, 3 tablet, 4 desktop */}
          <div className="px-4 md:px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center py-20 gap-4 text-center">
                    <Package size={40} strokeWidth={1} className="text-label-3" />
                    <p className="text-[15px] text-label-2">Nenhum produto nesta categoria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    {filtered.map(p => <ProductCard key={p.id} product={p} onClick={setActive} />)}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Banner WhatsApp */}
          <div className="mx-4 md:mx-6 mt-6 mb-4 ios-section max-w-2xl md:mx-auto">
            <div className="ios-row">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' }}>
                <MessageCircle size={16} strokeWidth={1.5} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-medium text-label">Compra pelo WhatsApp</p>
                <p className="text-[12px] text-label-2 mt-0.5">Toque em um produto para entrar em contato</p>
              </div>
              <ChevronRight size={16} strokeWidth={1.5} className="text-label-3" />
            </div>
          </div>

        </div>{/* /max-w-6xl */}
      </div>{/* /outer wrapper */}

      <ProductSheet product={active} onClose={() => setActive(null)} />
    </>
  )
}
