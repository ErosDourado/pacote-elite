import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Calendar, Scissors, Users, CalendarOff, ShoppingBag, MessageSquare } from 'lucide-react'
import { brandConfig } from '../../brandConfig'
import AppointmentsAdmin  from './AppointmentsAdmin'
import ServicesAdmin      from './ServicesAdmin'
import HomeAdmin          from './HomeAdmin'
import ClientsAdmin       from './ClientsAdmin'
import AvailabilityAdmin  from './AvailabilityAdmin'
import StockAdmin         from './StockAdmin'
import MessagesAdmin      from './MessagesAdmin'

const TABS = [
  { id: 'appointments',  label: 'Agenda',     Icon: Calendar,       Component: AppointmentsAdmin },
  { id: 'availability',  label: 'Disponib.',  Icon: CalendarOff,    Component: AvailabilityAdmin },
  { id: 'services',      label: 'Serviços',   Icon: Scissors,       Component: ServicesAdmin     },
  { id: 'clients',       label: 'Clientes',   Icon: Users,          Component: ClientsAdmin      },
  { id: 'messages',      label: 'Mensagens',  Icon: MessageSquare,  Component: MessagesAdmin     },
  { id: 'stock',         label: 'Loja',       Icon: ShoppingBag,    Component: StockAdmin        },
  { id: 'home',          label: 'Home',       Icon: Home,           Component: HomeAdmin         },
]

export default function AdminLayout({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('appointments')
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.Component ?? AppointmentsAdmin

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>

      {/* Header do painel — sem seta voltar; ícone Home à direita */}
      <div
        className="flex-shrink-0 ios-navbar px-5 flex items-center justify-between pb-3"
        style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}
      >
        <div>
          <p className="font-heading text-[18px] font-bold text-label tracking-tight leading-none">Painel Admin</p>
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

      {/* Tabs minimalistas (sem fundo sólido quando ativo) */}
      <div
        className="flex-shrink-0 px-4 py-2 flex gap-1 overflow-x-auto scrollbar-hide"
        style={{
          background: 'rgba(242,242,247,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '0.33px solid rgba(0,0,0,0.06)',
        }}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 relative"
              style={{
                background: active ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'transparent',
                color:       active ? 'var(--color-accent)' : 'var(--color-secondary)',
              }}
            >
              <tab.Icon size={13} strokeWidth={active ? 2 : 1.5} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Conteúdo da tab ativa */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
