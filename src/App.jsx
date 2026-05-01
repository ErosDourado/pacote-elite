import { useState, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp } from './context/AppContext'
import { brandConfig } from './brandConfig'
import BottomNav from './components/BottomNav'
import TopBar from './components/TopBar'
// Páginas críticas — carregadas no bundle inicial
import Home from './pages/Home'
import Scheduling from './pages/Scheduling'
import Catalog from './pages/Catalog'
import Profile from './pages/Profile'
import Login from './pages/Login'
// Páginas pesadas (Firestore SDK) — carregadas sob demanda quando admin acessa
const Admin   = lazy(() => import('./pages/Admin'))
const Finance = lazy(() => import('./pages/Finance'))

// Aplica o tema do brandConfig como CSS variables
function applyTheme() {
  const r = document.documentElement
  const { colors, font } = brandConfig
  r.style.setProperty('--color-accent',     colors.primary)
  r.style.setProperty('--color-secondary',  colors.secondary)
  r.style.setProperty('--color-bg',         colors.background)
  r.style.setProperty('--color-surface',    colors.surface)
  r.style.setProperty('--font-heading',     `'${font.heading}', sans-serif`)
  r.style.setProperty('--font-body',        `'${font.body}', sans-serif`)
  document.title = brandConfig.studioName
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors.background)
}

// Carrega Montserrat (300–900) do Google Fonts
function loadFonts() {
  const families = [
    `family=Montserrat:wght@300;400;500;600;700;800;900`,
  ].join('&')
  const href = `https://fonts.googleapis.com/css2?${families}&display=swap`
  if (document.querySelector(`link[href="${href}"]`)) return
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href })
  document.head.prepend(link)
}

const PAGES = {
  home:       Home,
  scheduling: Scheduling,
  catalog:    Catalog,
  profile:    Profile,
  login:      Login,
  admin:      Admin,
  finance:    Finance,
}

const ADMIN_ONLY = new Set(['admin', 'finance'])

const iosTransition = {
  initial: { opacity: 0, y: 14, scale: 0.99 },
  animate: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -8, scale: 0.99,  transition: { duration: 0.2 } },
}

// Spinner exibido enquanto chunk lazy carrega
function PageLoader() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
      <div
        className="w-8 h-8 rounded-full"
        style={{
          border: '2.5px solid rgba(120,120,128,0.18)',
          borderTopColor: 'var(--color-accent)',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Roteador interno (consome o AppContext pra guard de admin) ──
function AppRouter() {
  const { isAdmin, authLoading, firebaseOn } = useApp()
  const [activePage, setActivePage] = useState(() => {
    const saved = sessionStorage.getItem('activePage')
    return (saved && PAGES[saved]) ? saved : 'home'
  })
  const [pageState, setPageState]   = useState(null)

  useEffect(() => {
    applyTheme()
    loadFonts()
    // Bloqueia botão direito
    const noCtx = e => e.preventDefault()
    document.addEventListener('contextmenu', noCtx)
    // Bloqueia pinch-to-zoom e gestos do iOS Safari
    const noGesture = e => e.preventDefault()
    document.addEventListener('gesturestart',  noGesture, { passive: false })
    document.addEventListener('gesturechange', noGesture, { passive: false })
    document.addEventListener('gestureend',    noGesture, { passive: false })
    // Bloqueia double-tap zoom
    let lastTap = 0
    const noDbTap = e => { const now = Date.now(); if (now - lastTap < 300) e.preventDefault(); lastTap = now }
    document.addEventListener('touchend', noDbTap, { passive: false })
    return () => {
      document.removeEventListener('contextmenu', noCtx)
      document.removeEventListener('gesturestart',  noGesture)
      document.removeEventListener('gesturechange', noGesture)
      document.removeEventListener('gestureend',    noGesture)
      document.removeEventListener('touchend', noDbTap)
    }
  }, [])

  const navigate = (page, state = null) => {
    // Guard: rotas admin-only
    if (firebaseOn && ADMIN_ONLY.has(page) && !isAdmin) {
      if (authLoading) return
      setActivePage('login')
      setPageState({ redirectTo: page })
      return
    }
    setActivePage(page)
    setPageState(state)
    // Persiste para sobreviver ao F5/reload (exceto login)
    if (page !== 'login') {
      sessionStorage.setItem('activePage', page)
    }
  }

  // Se admin perde acesso enquanto está em rota admin (ex: deslogou), volta pra home
  useEffect(() => {
    if (firebaseOn && !authLoading && ADMIN_ONLY.has(activePage) && !isAdmin) {
      setActivePage('home')
      setPageState(null)
    }
  }, [isAdmin, authLoading, firebaseOn, activePage])

  const Page = PAGES[activePage] ?? Home
  const showChrome = !ADMIN_ONLY.has(activePage) && activePage !== 'login'

  return (
    <div
      className="fixed inset-0 w-full h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: brandConfig.colors.background,
        fontFamily: `'${brandConfig.font.body}', sans-serif`,
      }}
    >
      {showChrome && <TopBar onNavigate={navigate} />}

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            variants={iosTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className={showChrome ? 'pb-32' : ''}
          >
            <Suspense fallback={<PageLoader />}>
              <Page onNavigate={navigate} pageState={pageState} />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {showChrome && (
        <BottomNav activePage={activePage} onNavigate={navigate} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  )
}
