import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete, X } from 'lucide-react'

const PAD = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['','0','⌫'],
]

// Animação de shake (erro)
const shakeVariants = {
  idle:  { x: 0 },
  shake: {
    x: [0, -8, 8, -8, 8, -4, 4, 0],
    transition: { duration: 0.45, ease: 'easeInOut' },
  },
}

export default function PinModal({ onSuccess, onClose }) {
  const [pin,   setPin]   = useState('')
  const [error, setError] = useState(false)
  const [anim,  setAnim]  = useState('idle')

  const PIN_LENGTH = 4

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      onSuccess(pin)
        ? undefined // success handled by parent
        : (() => {
            setAnim('shake')
            setError(true)
            setTimeout(() => { setPin(''); setError(false); setAnim('idle') }, 800)
          })()
    }
  }, [pin])

  const press = (key) => {
    if (error) return
    if (key === '⌫') { setPin(p => p.slice(0, -1)); return }
    if (!key)         return
    if (pin.length < PIN_LENGTH) setPin(p => p + key)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        {/* Sheet */}
        <motion.div
          className="relative w-full max-w-sm z-10 pb-safe"
          style={{ background: 'var(--color-surface)', borderRadius: '28px 28px 0 0' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="w-9 h-1 rounded-full bg-gray-200 mx-auto mt-3 mb-6" />

          {/* Header */}
          <div className="px-6 pb-2 flex items-center justify-between">
            <div>
              <p className="font-heading text-[20px] font-bold tracking-tight text-label">
                Acesso Administrativo
              </p>
              <p className="text-[13px] text-label-2 mt-0.5">Digite o PIN de 4 dígitos</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(120,120,128,0.12)' }}>
              <X size={16} strokeWidth={2} className="text-label-2" />
            </button>
          </div>

          {/* PIN dots */}
          <motion.div
            className="flex justify-center gap-5 py-7"
            variants={shakeVariants}
            animate={anim}
          >
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <motion.div
                key={i}
                className="w-4 h-4 rounded-full border-2 transition-all duration-200"
                style={{
                  backgroundColor: i < pin.length ? (error ? '#FF3B30' : 'var(--color-accent)') : 'transparent',
                  borderColor:     i < pin.length ? (error ? '#FF3B30' : 'var(--color-accent)') : 'rgba(60,60,67,0.3)',
                }}
                animate={{ scale: i === pin.length - 1 ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.15 }}
              />
            ))}
          </motion.div>

          {error && (
            <motion.p
              className="text-center text-[13px] mb-2"
              style={{ color: '#FF3B30' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              PIN incorreto. Tente novamente.
            </motion.p>
          )}

          {/* Number pad */}
          <div className="px-10 pb-8 grid grid-cols-3 gap-3">
            {PAD.flat().map((key, idx) => (
              <button
                key={idx}
                onClick={() => press(key)}
                disabled={!key}
                className="h-16 rounded-2xl flex items-center justify-center text-[22px] font-medium transition-all duration-100 active:scale-90 select-none"
                style={{
                  background: key ? (key === '⌫' ? 'transparent' : 'rgba(120,120,128,0.12)') : 'transparent',
                  color: key === '⌫' ? 'var(--color-accent)' : '#1D1D1F',
                  pointerEvents: !key ? 'none' : undefined,
                }}
              >
                {key === '⌫' ? <Delete size={22} strokeWidth={1.5} /> : key}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
