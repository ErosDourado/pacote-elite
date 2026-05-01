import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, User, Sliders, CircleDollarSign, LogIn, LogOut, ShoppingBag } from 'lucide-react'
import { themeConfig } from '../themeConfig'
import { useApp } from '../context/AppContext'

export default function TopBar({ onNavigate }) {
  const { isAdmin, currentUser, firebaseOn, logoutAdmin, loginAdmin, cart } = useApp()
  const cartQty = cart.reduce((s, i) => s + i.qty, 0)
  const [open, setOpen] = useState(false)

  const isLoggedIn = !!currentUser

  // ── Monta menu dinamicamente ──────────────────────────────────
  const items = []

  if (!isLoggedIn) {
    // Não logado → só Entrar / Criar Conta
    items.push({
      id: 'login',
      label: 'Login / Criar Conta',
      Icon: LogIn,
      onClick: () => onNavigate('login'),
    })
  } else {
    // Logado → Meu Perfil sempre visível
    items.push({ id: 'profile', label: 'Meu Perfil', Icon: User, onClick: () => onNavigate('profile') })

    // Painéis só para admins
    if (isAdmin) {
      items.push({ id: 'admin',   label: 'Painel Admin',      Icon: Sliders,          onClick: () => onNavigate('admin')   })
      items.push({ id: 'finance', label: 'Painel Financeiro', Icon: CircleDollarSign, onClick: () => onNavigate('finance') })
    }

    // Sair
    items.push({
      id: 'logout',
      label: 'Sair',
      Icon: LogOut,
      danger: true,
      onClick: async () => { await logoutAdmin() },
    })
  }

  return (
    <header
      className="flex-shrink-0 relative z-30"
      style={{
        background: 'rgba(250,250,250,0.88)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '0.33px solid rgba(0,0,0,0.06)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="grid grid-cols-[80px_1fr_80px] items-center px-4 h-14">
        {/* Spacer esquerdo — mesma largura da direita pra logo ficar centralizada */}
        <div />

        {/* Logo / nome — centralizada */}
        <div className="flex justify-center">
          {themeConfig.logoUrl ? (
            <img src={themeConfig.logoUrl} alt={themeConfig.appName} className="h-7 object-contain" />
          ) : (
            <p className="font-heading text-[17px] font-bold text-label tracking-tight leading-none text-center">
              {themeConfig.appName}
            </p>
          )}
        </div>

        {/* Direita: carrinho + três pontos */}
        <div className="flex items-center justify-end gap-1.5">
          {/* Botão carrinho */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => onNavigate('profile')}
            className="relative w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(120,120,128,0.1)' }}
            aria-label="Carrinho"
          >
            <ShoppingBag size={16} strokeWidth={1.5} style={{ color: 'var(--color-secondary)' }} />
            {cartQty > 0 && (
              <span
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{ background: 'var(--color-accent)', fontSize: 9, fontWeight: 800, lineHeight: 1 }}
              >
                {cartQty > 9 ? '9+' : cartQty}
              </span>
            )}
          </motion.button>

          {/* Três pontos */}
          <div className="relative">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setOpen(o => !o)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: open ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)' : 'rgba(120,120,128,0.1)' }}
          >
            <MoreVertical size={18} strokeWidth={1.5}
              style={{ color: open ? 'var(--color-accent)' : 'var(--color-secondary)' }} />
          </motion.button>

          <AnimatePresence>
            {open && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpen(false)}
                  onTouchStart={() => setOpen(false)}
                />

                <motion.div
                  className="absolute right-0 z-50 w-56 overflow-hidden"
                  style={{
                    top: '2.75rem',
                    background: '#FAFAFA',
                    borderRadius: 14,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                    border: '0.33px solid rgba(60,60,67,0.14)',
                  }}
                  initial={{ opacity: 0, scale: 0.9, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -6 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                >
                  {/* Header com email do usuário (se logado) */}
                  {isLoggedIn && (
                    <div className="px-4 py-3" style={{ borderBottom: '0.33px solid rgba(60,60,67,0.1)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(60,60,67,0.45)' }}>
                        {isAdmin ? 'Conta Admin' : 'Conta'}
                      </p>
                      <p className="text-[13px] font-semibold text-label truncate mt-0.5">{currentUser.email}</p>
                    </div>
                  )}

                  {items.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={async () => { await item.onClick(); setOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:opacity-60 transition-opacity"
                      style={{ borderBottom: i < items.length - 1 ? '0.33px solid rgba(60,60,67,0.1)' : 'none' }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: item.danger
                            ? 'rgba(255,59,48,0.10)'
                            : 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
                        }}
                      >
                        <item.Icon
                          size={14}
                          strokeWidth={1.5}
                          style={{ color: item.danger ? '#FF3B30' : 'var(--color-accent)' }}
                        />
                      </div>
                      <span
                        className="text-[15px] font-medium"
                        style={{ color: item.danger ? '#FF3B30' : '#1D1D1F' }}
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
          </div>{/* /três pontos */}
        </div>{/* /direita */}
      </div>
    </header>
  )
}
