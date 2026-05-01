import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { brandConfig } from '../brandConfig'
import FinanceAdmin from './admin/FinanceAdmin'

export default function Finance({ onNavigate }) {
  const { isAdmin } = useApp()

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-8 text-center gap-5">
        <p className="text-[17px] text-label-2">Acesso não autorizado.</p>
        <button onClick={() => onNavigate('home')} className="btn-fill">
          Voltar ao Início
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <div className="flex-shrink-0 ios-navbar px-5 flex items-center justify-between pb-3"
        style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <div>
          <p className="font-heading text-[18px] font-bold text-label tracking-tight leading-none">Financeiro</p>
          <p className="text-[11px] text-label-2 mt-0.5">{brandConfig.studioName}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => onNavigate('home')}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' }}
          aria-label="Voltar ao início"
        >
          <Home size={17} strokeWidth={1.75} className="text-accent" />
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-8">
        <FinanceAdmin />
      </div>
    </div>
  )
}
