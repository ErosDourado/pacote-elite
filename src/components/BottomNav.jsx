import { motion } from 'framer-motion'
import { Home, Calendar, ShoppingBag } from 'lucide-react'

const TABS = [
  { id: 'home',       Icon: Home,        label: 'Início'  },
  { id: 'scheduling', Icon: Calendar,    label: 'Agendar' },
  { id: 'catalog',    Icon: ShoppingBag, label: 'Loja'    },
]

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 z-50"
      style={{ bottom: 'max(24px, calc(env(safe-area-inset-bottom, 0px) + 12px))' }}
    >
      <div
        className="flex items-center gap-1 px-2 py-2 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
          border: '0.33px solid rgba(0,0,0,0.08)',
        }}
      >
        {TABS.map(tab => {
          const active = activePage === tab.id
          return (
            <button
              key={tab.id}
              className="relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-full transition-colors duration-200 select-none cursor-pointer"
              style={{ minWidth: 68 }}
              onClick={() => onNavigate(tab.id)}
            >
              {active && (
                <motion.div
                  layoutId="pill-tab"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'var(--color-accent)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 42 }}
                />
              )}
              <tab.Icon
                size={22}
                strokeWidth={active ? 2 : 1.5}
                className="relative z-10 transition-colors duration-200"
                style={{ color: active ? '#fff' : 'var(--color-secondary)' }}
              />
              <span
                className="text-[10px] font-medium relative z-10 transition-colors duration-200"
                style={{ color: active ? '#fff' : 'var(--color-secondary)' }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
