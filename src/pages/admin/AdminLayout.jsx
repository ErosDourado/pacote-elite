import { useState, Component } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Calendar, Scissors, Users, CalendarOff, ShoppingBag, MessageSquare, Bell } from 'lucide-react'
import { brandConfig } from '../../brandConfig'
import AppointmentsAdmin  from './AppointmentsAdmin'
import ServicesAdmin      from './ServicesAdmin'
import HomeAdmin          from './HomeAdmin'
import ClientsAdmin       from './ClientsAdmin'
import AvailabilityAdmin  from './AvailabilityAdmin'
import StockAdmin         from './StockAdmin'
import MessagesAdmin      from './MessagesAdmin'
import NotificationsAdmin from './NotificationsAdmin'

const TABS = [
  { id: 'appointments',  label: 'Agenda',     Icon: Calendar,       Component: AppointmentsAdmin },
  { id: 'availability',  label: 'Disponib.',  Icon: CalendarOff,    Component: AvailabilityAdmin },
  { id: 'services',      label: 'Serviços',   Icon: Scissors,       Component: ServicesAdmin     },
  { id: 'clients',       label: 'Clientes',   Icon: Users,          Component: ClientsAdmin      },
  { id: 'messages',      label: 'Mensagens',  Icon: MessageSquare,  Component: MessagesAdmin     },
  { id: 'stock',         label: 'Loja',       Icon: ShoppingBag,    Component: StockAdmin        },
  { id: 'home',          label: 'Home',       Icon: Home,           Component: HomeAdmin         },
  { id: 'notifications', label: 'Notif.',     Icon: Bell,           Component: NotificationsAdmin },
]

class TabErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null, retryKey: 0 } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('[AdminTab]', error, info) }
  render() {
    if (this.state.error) {
      const msg = this.state.error?.message || String(this.state.error)
      return (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-3">
          <p className="text-[15px] font-semibold text-label">Erro nesta seção</p>
          <p className="text-[12px] text-label-2">Tente trocar de aba e voltar.</p>
          <p className="text-[11px] font-mono break-all" style={{ color: 'rgba(60,60,67,0.55)', maxWidth: 320 }}>
            {msg}
          </p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => this.setState(s => ({ error: null, retryKey: s.retryKey + 1 }))}
              className="px-5 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider text-white"
              style={{ background: 'var(--color-accent)' }}
            >
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', color: 'var(--color-accent)' }}
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }
    // key força remount dos children no retry
    return <div key={this.state.retryKey}>{this.props.children}</div>
  }
}

export default function AdminLayout({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('appointments')
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.Component ?? AppointmentsAdmin

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>

      {/* Header do painel — sem seta voltar; ícone Home à direita */}
      <div
        className="flex-shrink-0 ios-navbar px-5 md:px-8 flex items-center justify-between pb-3 max-w-7xl mx-auto w-full"
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
        className="flex-shrink-0 px-4 md:px-8 py-2 flex gap-1 overflow-x-auto scrollbar-hide max-w-7xl mx-auto w-full"
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
            className="max-w-7xl mx-auto w-full md:px-4"
          >
            <TabErrorBoundary key={activeTab}>
              <ActiveComponent onNavigate={onNavigate} />
            </TabErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
