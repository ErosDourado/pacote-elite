import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { brandConfig } from '../brandConfig'
import { observeAuth, signOut as authSignOut } from '../services/authService'
import { subscribeAdminStatus } from '../services/adminsService'
import { subscribeServices } from '../services/servicesService'
import { isFirebaseConfigured } from '../firebase'
import {
  INITIAL_SERVICES,
  INITIAL_PRODUCTS,
  INITIAL_BANNERS,
  INITIAL_FEED,
  INITIAL_HIGHLIGHTS,
  INITIAL_APPOINTMENTS,
  INITIAL_BLOCKS,
  INITIAL_PROCEDURES,
  INITIAL_LINKS,
  INITIAL_WA_TEMPLATES,
  INITIAL_WAITLIST,
  INITIAL_GALLERY,
} from '../mockData'

const AppContext = createContext(null)

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

export function AppProvider({ children }) {
  // ── Estado principal ──────────────────────────────────────────
  const [services,     setServices]     = useState(() => load('svc',    INITIAL_SERVICES))
  const [products,     setProducts]     = useState(() => load('prod',   INITIAL_PRODUCTS))
  const [banners,      setBanners]      = useState(() => load('bnr',    INITIAL_BANNERS))
  const [highlights,   setHighlights]   = useState(() => load('hl',     INITIAL_HIGHLIGHTS))
  const [feedPosts,    setFeedPosts]    = useState(() => load('feed',   INITIAL_FEED))
  const [procedures,   setProcedures]   = useState(() => load('procs',  INITIAL_PROCEDURES))
  const [links,        setLinks]        = useState(() => load('links',  INITIAL_LINKS))
  const [waTemplates,  setWaTemplates]  = useState(() => load('watpl',  INITIAL_WA_TEMPLATES))
  const [appointments, setAppointments] = useState(() => load('appts',    INITIAL_APPOINTMENTS))
  const [blocks,       setBlocks]       = useState(() => load('blocks',   INITIAL_BLOCKS))
  const [waitlist,     setWaitlist]     = useState(() => load('waitlist', INITIAL_WAITLIST))
  const [gallery,      setGallery]      = useState(() => load('gallery',  INITIAL_GALLERY))
  const [profile,      setProfileState] = useState(() => load('prof',   { name: '', phone: '', email: '' }))
  const [cart,         setCart]         = useState(() => load('cart',    []))

  // ── Auth real (Firebase) ──────────────────────────────────────
  // Se Firebase não estiver configurado, usa modo dev (isAdmin=true)
  const firebaseOn = isFirebaseConfigured()
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin,     setIsAdmin]     = useState(false) // segurança: começa sempre como false
  const [authLoading, setAuthLoading] = useState(firebaseOn)  // se Firebase ON, começa carregando

  // Sincroniza serviços do Firestore quando Firebase está configurado
  useEffect(() => {
    if (!firebaseOn) return
    const unsub = subscribeServices(
      items => setServices(items),
      err => console.error('[AppContext] services sync:', err)
    )
    return () => unsub()
  }, [firebaseOn])

  // Observa mudanças de login + status admin
  useEffect(() => {
    if (!firebaseOn) return
    let unsubAdmin = null
    const unsubAuth = observeAuth(user => {
      setCurrentUser(user)
      // Cancela subscribe admin anterior
      if (unsubAdmin) { unsubAdmin(); unsubAdmin = null }
      if (user?.email) {
        // Sincroniza email no profile do app
        setProfileState(prev => ({ ...prev, email: user.email, name: prev.name || user.displayName || '' }))
        unsubAdmin = subscribeAdminStatus(user.email, (admin) => {
          setIsAdmin(admin)
          setAuthLoading(false)
        })
      } else {
        setIsAdmin(false)
        setAuthLoading(false)
      }
    })
    return () => {
      unsubAuth()
      if (unsubAdmin) unsubAdmin()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseOn])

  // ── Persistência automática ───────────────────────────────────
  useEffect(() => { localStorage.setItem('svc',    JSON.stringify(services))     }, [services])
  useEffect(() => { localStorage.setItem('prod',   JSON.stringify(products))     }, [products])
  useEffect(() => { localStorage.setItem('bnr',    JSON.stringify(banners))      }, [banners])
  useEffect(() => { localStorage.setItem('hl',     JSON.stringify(highlights))   }, [highlights])
  useEffect(() => { localStorage.setItem('feed',   JSON.stringify(feedPosts))    }, [feedPosts])
  useEffect(() => { localStorage.setItem('procs',  JSON.stringify(procedures))   }, [procedures])
  useEffect(() => { localStorage.setItem('links',  JSON.stringify(links))        }, [links])
  useEffect(() => { localStorage.setItem('watpl',  JSON.stringify(waTemplates))  }, [waTemplates])
  useEffect(() => { localStorage.setItem('appts',    JSON.stringify(appointments)) }, [appointments])
  useEffect(() => { localStorage.setItem('blocks',   JSON.stringify(blocks))       }, [blocks])
  useEffect(() => { localStorage.setItem('waitlist', JSON.stringify(waitlist))     }, [waitlist])
  useEffect(() => { localStorage.setItem('gallery',  JSON.stringify(gallery))      }, [gallery])
  useEffect(() => { localStorage.setItem('prof',     JSON.stringify(profile))      }, [profile])
  useEffect(() => { localStorage.setItem('cart',     JSON.stringify(cart))         }, [cart])

  // ── Agendamentos ──────────────────────────────────────────────
  const addAppointment = (data) => {
    const a = { ...data, id: Date.now(), createdAt: new Date().toISOString(), status: 'pending', paymentStatus: 'pending' }
    setAppointments(prev => [a, ...prev])
    return a
  }

  /** Verifica se um horário está ocupado (não cancelado). */
  const isSlotTaken = (date, time) =>
    appointments.some(a => a.date === date && a.time === time && a.status !== 'cancelled')

  // ── Fila de Espera ────────────────────────────────────────────
  const addToWaitlist = (data) => {
    const entry = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      notifiedAt: null,
      wantEarlier: false,
      ...data,
    }
    setWaitlist(prev => [...prev, entry])
    return entry
  }
  const removeFromWaitlist = (id) =>
    setWaitlist(prev => prev.filter(w => w.id !== id))
  const markWaitlistNotified = (id) =>
    setWaitlist(prev => prev.map(w => w.id === id ? { ...w, notifiedAt: new Date().toISOString() } : w))

  /** Encontra candidatos da fila pra um slot liberado.
   *  Match exato em date+time, OU wantEarlier+(slot anterior à preferência). */
  const findWaitlistCandidates = ({ date, time, serviceId } = {}) => {
    if (!date || !time) return []
    return waitlist.filter(entry => {
      if (entry.notifiedAt) return false
      if (serviceId && entry.serviceId && String(entry.serviceId) !== String(serviceId)) return false
      // Match exato
      if (entry.preferredDate === date && entry.preferredTime === time) return true
      // wantEarlier: aceita vaga ANTES da preferência
      if (entry.wantEarlier && entry.preferredDate) {
        if (date < entry.preferredDate) return true
        if (date === entry.preferredDate && time < entry.preferredTime) return true
      }
      return false
    })
  }

  // ── Galeria do Studio ────────────────────────────────────────
  const addGalleryPhoto    = (p)     => setGallery(prev => [...prev, { ...p, id: Date.now() }])
  const removeGalleryPhoto = (id)    => setGallery(prev => prev.filter(g => g.id !== id))
  const updateGalleryPhoto = (id, p) => setGallery(prev => prev.map(g => g.id === id ? { ...g, ...p } : g))
  const cancelAppointment  = (id) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled', paymentStatus: 'refunded' } : a))
  const completeAppointment = (id) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed', paymentStatus: 'paid' } : a))
  const deleteAppointment = (id) => setAppointments(prev => prev.filter(a => a.id !== id))
  const updateAppointmentStatus = (id, status) => {
    const payMap = { completed: 'paid', cancelled: 'refunded', confirmed: 'pending' }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, paymentStatus: payMap[status] ?? a.paymentStatus } : a))
  }

  // ── Serviços ──────────────────────────────────────────────────
  const addService    = (s)     => setServices(prev => [...prev, { ...s, id: Date.now() }])
  const removeService = (id)    => setServices(prev => prev.filter(s => s.id !== id))
  const updateService = (id, p) => setServices(prev => prev.map(s => s.id === id ? { ...s, ...p } : s))

  // ── Produtos ──────────────────────────────────────────────────
  const addProduct    = (p)     => setProducts(prev => [...prev, { ...p, id: Date.now(), inStock: true, stockQty: parseInt(p.stockQty) || 0 }])
  const removeProduct = (id)    => setProducts(prev => prev.filter(p => p.id !== id))
  const updateProduct = (id, p) => setProducts(prev => prev.map(x => x.id === id ? { ...x, ...p } : x))
  const toggleStock   = (id)    => setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p))

  // ── Banners ───────────────────────────────────────────────────
  const addBanner    = (b)     => setBanners(prev => [...prev, { ...b, id: Date.now() }])
  const removeBanner = (id)    => setBanners(prev => prev.filter(b => b.id !== id))
  const updateBanner = (id, p) => setBanners(prev => prev.map(b => b.id === id ? { ...b, ...p } : b))

  // ── Feed ──────────────────────────────────────────────────────
  const addFeedPost    = (post) => setFeedPosts(prev => [{ ...post, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] }, ...prev])
  const removeFeedPost = (id)   => setFeedPosts(prev => prev.filter(p => p.id !== id))
  const updateFeedPost = (id, p) => setFeedPosts(prev => prev.map(x => x.id === id ? { ...x, ...p } : x))

  // ── Destaques ─────────────────────────────────────────────────
  const addHighlight    = (h)   => setHighlights(prev => [...prev, { ...h, id: Date.now() }])
  const removeHighlight = (id)  => setHighlights(prev => prev.filter(h => h.id !== id))

  // ── Procedimentos ─────────────────────────────────────────────
  const addProcedure    = (p)   => setProcedures(prev => [...prev, { ...p, id: Date.now() }])
  const removeProcedure = (id)  => setProcedures(prev => prev.filter(p => p.id !== id))
  const updateProcedure = (id, p) => setProcedures(prev => prev.map(x => x.id === id ? { ...x, ...p } : x))

  // ── Links externos (Linktree) ────────────────────────────────
  const addLink    = (l)   => setLinks(prev => [...prev, { ...l, id: Date.now() }])
  const removeLink = (id)  => setLinks(prev => prev.filter(l => l.id !== id))
  const updateLink = (id, l) => setLinks(prev => prev.map(x => x.id === id ? { ...x, ...l } : x))

  // ── Templates do WhatsApp ────────────────────────────────────
  const updateWaTemplate = (status, msg) => setWaTemplates(prev => ({ ...prev, [status]: msg }))

  // ── VIP do cliente ───────────────────────────────────────────
  const isVipClient = (phone) => {
    const list = profile.vipPhones || []
    return list.includes(phone)
  }
  const toggleVip = (phone) => {
    setProfileState(prev => {
      const list = prev.vipPhones || []
      const next = list.includes(phone) ? list.filter(p => p !== phone) : [...list, phone]
      return { ...prev, vipPhones: next }
    })
  }

  // ── Disponibilidade ───────────────────────────────────────────
  const addBlock    = (b)     => setBlocks(prev => [...prev, { ...b, id: Date.now() }])
  const removeBlock = (id)    => setBlocks(prev => prev.filter(b => b.id !== id))
  const updateBlock = (id, p) => setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...p } : b))

  // ── Carrinho ──────────────────────────────────────────────────
  const addToCart = (product, pickupOption) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id && i.pickupOption === pickupOption)
      if (existing) return prev.map(i => (i.productId === product.id && i.pickupOption === pickupOption) ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { id: Date.now(), productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl || '', pickupOption, qty: 1 }]
    })
  }
  const removeFromCart  = (id)       => setCart(prev => prev.filter(i => i.id !== id))
  const updateCartQty   = (id, qty)  => qty <= 0 ? removeFromCart(id) : setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  const clearCart       = ()         => setCart([])

  // ── Perfil da cliente ─────────────────────────────────────────
  const setProfile = (data) => setProfileState(prev => ({ ...prev, ...data }))

  // ── Auth admin ────────────────────────────────────────────────
  // Compat: loginAdmin/logoutAdmin antigos.
  // logout faz signOut real do Firebase (se houver).
  const loginAdmin  = (pin) => { if (pin === brandConfig.adminPin) { setIsAdmin(true); return true } return false }
  const logoutAdmin = async () => {
    if (firebaseOn) {
      try { await authSignOut() } catch {}
    } else {
      setIsAdmin(false)
    }
  }

  // ── Clientes (derivado dos agendamentos) ──────────────────────
  const clients = useMemo(() => {
    const map = {}
    appointments.forEach(a => {
      const key = a.clientPhone
      if (!map[key]) {
        map[key] = { name: a.clientName, phone: a.clientPhone, appointments: [], totalSpent: 0, lastVisit: '' }
      }
      map[key].appointments.push(a)
      if (a.paymentStatus === 'paid') map[key].totalSpent += (a.service?.price ?? 0)
      if (a.date > map[key].lastVisit) map[key].lastVisit = a.date
    })
    return Object.values(map).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit))
  }, [appointments])

  // ── Métricas financeiras (derivadas dos agendamentos) ─────────
  const finance = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const nowMonth = todayStr.slice(0, 7)

    const paid = appointments.filter(a => a.paymentStatus === 'paid')
    const todayPaid  = paid.filter(a => a.date === todayStr)
    const monthPaid  = paid.filter(a => a.date.startsWith(nowMonth))

    const sum = arr => arr.reduce((s, a) => s + (a.service?.price ?? 0), 0)

    return {
      revenueToday:  sum(todayPaid),
      revenueMonth:  sum(monthPaid),
      revenueTotal:  sum(paid),
      averageTicket: paid.length ? sum(paid) / paid.length : 0,
      totalClients:  clients.length,
      totalAppts:    appointments.length,
      pendingAppts:  appointments.filter(a => a.status === 'confirmed').length,
    }
  }, [appointments, clients])

  return (
    <AppContext.Provider value={{
      // Estado
      services, products, banners, highlights, feedPosts, procedures, links, waTemplates,
      appointments, blocks, waitlist, gallery, profile, cart, isAdmin,
      // Auth
      currentUser, authLoading, firebaseOn,
      // Derivados
      clients, finance,
      // Agendamentos
      addAppointment, cancelAppointment, completeAppointment, deleteAppointment, updateAppointmentStatus,
      isSlotTaken,
      // Fila de Espera
      addToWaitlist, removeFromWaitlist, markWaitlistNotified, findWaitlistCandidates,
      // Galeria
      addGalleryPhoto, removeGalleryPhoto, updateGalleryPhoto,
      // Serviços
      addService, removeService, updateService,
      // Produtos
      addProduct, removeProduct, updateProduct, toggleStock,
      // Banners
      addBanner, removeBanner, updateBanner,
      // Feed
      addFeedPost, removeFeedPost, updateFeedPost,
      // Destaques
      addHighlight, removeHighlight,
      // Procedimentos
      addProcedure, removeProcedure, updateProcedure,
      // Links externos
      addLink, removeLink, updateLink,
      // Templates WA
      updateWaTemplate,
      // VIP
      isVipClient, toggleVip,
      // Disponibilidade
      addBlock, removeBlock, updateBlock,
      // Perfil
      setProfile,
      // Carrinho
      addToCart, removeFromCart, updateCartQty, clearCart,
      // Auth
      loginAdmin, logoutAdmin,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
