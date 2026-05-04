import { motion } from 'framer-motion'
import { brandConfig } from '../brandConfig'

export default function Splash() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: brandConfig.colors.background }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo ou Iniciais */}
        <div 
          className="w-24 h-24 rounded-[28px] flex items-center justify-center shadow-2xl"
          style={{ background: 'var(--color-surface)', border: '1px solid rgba(0,0,0,0.05)' }}
        >
          <span 
            className="text-[32px] font-black tracking-tighter"
            style={{ color: 'var(--color-accent)' }}
          >
            {brandConfig.studioName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 
            className="font-heading text-[20px] font-black uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            {brandConfig.studioName}
          </h1>
          <div className="flex items-center gap-1.5 mt-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--color-accent)' }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Frase de efeito opcional no rodapé */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: 'rgba(60,60,67,0.3)' }}
      >
        Carregando sua experiência...
      </motion.p>
    </motion.div>
  )
}
