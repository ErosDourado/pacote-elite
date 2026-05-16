import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { idbPut, idbDel, idbAll } from '../utils/imageDB'
import { brandConfig } from '../brandConfig'
import { observeAuth, signOut as authSignOut } from '../services/authService'
import { subscribeAdminStatus } from '../services/adminsService'
import { subscribeServices } from '../services/servicesService'
import { subscribeProducts, createProduct, updateProduct as fsUpdateProduct, deleteProduct, toggleProductStock } from '../services/productsService'
import { subscribeBanners, createBanner, updateBanner as fsUpdateBanner, deleteBanner } from '../services/bannersService'
import { subscribeFeedPosts, createFeedPost, updateFeedPost as fsUpdateFeedPost, deleteFeedPost } from '../services/feedService'
import { subscribeProcedures, createProcedure, updateProcedure as fsUpdateProcedure, deleteProcedure } from '../services/proceduresService'
import { subscribeGallery, createGalleryPhoto, updateGalleryPhoto as fsUpdateGalleryPhoto, deleteGalleryPhoto } from '../services/galleryService'
import { subscribeAppointments, createAppointment, updateAppointmentStatus as fsUpdateApptStatus, deleteAppointment as fsDeleteAppt } from '../services/appointmentsService'
import { subscribeWaitlist, createWaitlistEntry, deleteWaitlistEntry, markNotified } from '../services/waitlistService'
import { subscribeLinks, createLink, updateLink as fsUpdateLink, deleteLink } from '../services/linksService'
import { upsertUsuario, updateUsuarioVip, updateUsuarioVipByEmail, subscribeUsuarios } from '../services/usuariosService'
import { isFirebaseConfigured } from '../firebase'
import { notifyOwner } from '../services/notificationsService'
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

const safeSave = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) }
  catch { /* QuotaExceededError: silently ignore */ }
}

export function AppProvider({ children }) {
  const firebaseOn = isFirebaseConfigured()

  // ── Estado — conteúdo compartilhado (Firestore quando online) ──
  const [services,     setServices]     = useState(INITIAL_SERVICES)
  const [products,     setProducts]     = useState(INITIAL_PRODUCTS)
  const [banners,      setBanners]      = useState(INITIAL_BANNERS)
  const [feedPosts,    setFeedPosts]    = useState(INITIAL_FEED)
  const [procedures,   setProcedures]   = useState(INITIAL_PROCEDURES)
  const [gallery,      setGallery]      = useState(INITIAL_GALLERY)
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS)
  const [waitlist,     setWaitlist]     = useState(INITIAL_WAITLIST)
  const [links,        setLinks]        = useState(INITIAL_LINKS)
  const [usuarios,     setUsuarios]     = useState([])

  // ── Estado — local (localStorage, por dispositivo) ─────────────
  const [highlights,   setHighlights]   = useState(() => load('hl',     INITIAL_HIGHLIGHTS))
  const [waTemplates,  setWaTemplates]  = useState(() => load('watpl',  INITIAL_WA_TEMPLATES))
  const [blocks,       setBlocks]       = useState(() => load('blocks', INITIAL_BLOCKS))
  const [profile,      setProfileState] = useState(() => load('prof',   { name: '', phone: '', email: '' }))
  const [cart,         setCart]         = useState(() => load('cart',   []))

  const DEFAULT_WH = { start: '09:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00', interval: 60 }
  const [workingHours, setWorkingHoursState] = useState(() => load('workingHours', DEFAULT_WH))

  // ── Mapa de imagens (IndexedDB — backward compat para idb: keys) ─
  const [imageMap, setImageMap] = useState({})

  useEffect(() => {
    idbAll().then(map => setImageMap(map))
  }, [])

  const resolveImage = useCallback((src) => {
    if (!src) return ''
    if (src.startsWith('idb:')) return imageMap[src] ?? ''
    return src
  }, [imageMap])

  const registerImage = useCallback((key, val) => {
    setImageMap(prev => ({ ...prev, [key]: val }))
  }, [])

  const unregisterImage = useCallback((key) => {
    if (key?.startsWith('idb:')) idbDel(key)
    setImageMap(prev => { const n = { ...prev }; delete n[key]; return n })
  }, [])

  // ── Auth real (Firebase) ──────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin,     setIsAdmin]     = useState(false)
  const [authLoading, setAuthLoading] = useState(firebaseOn)
  const [dataLoaded,  setDataLoaded]  = useState(!firebaseOn) // Se offline, já está pronto (mock)

  // ── Subscriptions Firestore (todos os conteúdos compartilhados) ─
  useEffect(() => {
    if (!firebaseOn) return

    // Conjunto para rastrear quais coleções já emitiram o primeiro dado
    const critical = new Set(['services', 'products', 'banners', 'feed', 'procedures', 'gallery', 'links'])
    const emitted = new Set()

    const checkReady = (key, data) => {
      emitted.add(key)
      
      // Se forem banners e houver algum, tentamos pre-carregar a primeira imagem
      if (key === 'banners' && data?.length > 0) {
        const firstBanner = data[0]
        const src = resolveImage(firstBanner.url)
        if (src && !src.startsWith('idb:')) { // Pre-load apenas se for URL externa/Firebase
          const img = new Image()
          img.src = src
          img.onload = () => {
            emitted.add('banner_img')
            finishIfReady()
          }
          img.onerror = () => {
            emitted.add('banner_img')
            finishIfReady()
          }
        } else {
          emitted.add('banner_img')
        }
      } else if (key === 'banners') {
        emitted.add('banner_img')
      }

      finishIfReady()
    }

    const finishIfReady = () => {
      const hasBanners = emitted.has('banner_img')
      if (emitted.size >= critical.size + (hasBanners ? 1 : 0)) {
        setTimeout(() => setDataLoaded(true), 400)
      }
    }

    const unsubs = [
      subscribeServices(s => { setServices(s); checkReady('services') }, e => console.error('[ctx] services:', e)),
      subscribeProducts(s => { setProducts(s); checkReady('products') }, e => console.error('[ctx] products:', e)),
      subscribeBanners(s =>  { setBanners(s);  checkReady('banners', s) }, e => console.error('[ctx] banners:', e)),
      subscribeFeedPosts(s => { setFeedPosts(s); checkReady('feed')     }, e => console.error('[ctx] feed:', e)),
      subscribeProcedures(s => { setProcedures(s); checkReady('procedures') }, e => console.error('[ctx] procedures:', e)),
      subscribeGallery(s => { setGallery(s);   checkReady('gallery') }, e => console.error('[ctx] gallery:', e)),
      subscribeLinks(s =>   { setLinks(s);     checkReady('links')   }, e => console.error('[ctx] links:', e)),

      subscribeAppointments(setAppointments, e => console.error('[ctx] appts:', e)),
      subscribeWaitlist(setWaitlist,     e => console.error('[ctx] waitlist:', e)),
      subscribeUsuarios(setUsuarios,     e => console.error('[ctx] usuarios:', e)),
    ]
    return () => unsubs.forEach(u => u())
  }, [firebaseOn, resolveImage])

  // Pre-load de imagens dos banners para evitar "pulo" visual
  useEffect(() => {
    if (!dataLoaded || banners.length === 0) return
    banners.forEach(b => {
      const src = resolveImage(b.url)
      if (src) {
        const img = new Image()
        img.src = src
      }
    })
  }, [dataLoaded, banners, resolveImage])

  // Observa mudanças de login + status admin
  useEffect(() => {
    if (!firebaseOn) return
    let unsubAdmin = null
    const unsubAuth = observeAuth(user => {
      setCurrentUser(user)
      if (unsubAdmin) { unsubAdmin(); unsubAdmin = null }
      if (user?.email) {
        setProfileState(prev => {
          const next = { ...prev, email: user.email, name: prev.name || user.displayName || '' }
          // Garante que o admin tenha entrada no Firestore com email (mesmo sem telefone)
          upsertUsuario({ name: next.name, email: user.email, phone: next.phone || '' })
          return next
        })
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

  // ── Persistência local (somente estado local) ─────────────────
  useEffect(() => { safeSave('hl',          highlights)   }, [highlights])
  useEffect(() => { safeSave('watpl',       waTemplates)  }, [waTemplates])
  useEffect(() => { safeSave('blocks',      blocks)       }, [blocks])
  useEffect(() => { safeSave('prof',        profile)      }, [profile])
  useEffect(() => { safeSave('cart',        cart)         }, [cart])
  useEffect(() => { safeSave('workingHours', workingHours) }, [workingHours])

  // Gera lista de horários disponíveis
  const availableHours = useMemo(() => {
    const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0) }
    const toStr = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    const { start, end, lunchStart, lunchEnd, interval } = workingHours
    const startM = toMin(start), endM = toMin(end), lsM = toMin(lunchStart), leM = toMin(lunchEnd)
    const result = []
    for (let m = startM; m < endM; m += Number(interval)) {
      if (m >= lsM && m < leM) continue
      result.push(toStr(m))
    }
    return result
  }, [workingHours])

  const setWorkingHours = (data) => setWorkingHoursState(prev => ({ ...prev, ...data }))

  // ── Agendamentos ──────────────────────────────────────────────
  const addAppointment = async (data) => {
    const a = { ...data, status: 'pending', paymentStatus: 'pending' }
    if (firebaseOn) {
      const id = await createAppointment(a)
      if (data.date && data.time) {
        const [y, m, d] = data.date.split('-')
        notifyOwner(
          '📅 Novo Agendamento',
          `${data.clientName} · ${data.service?.name ?? ''} · ${d}/${m} às ${data.time}`
        )
      }
      return { ...a, id }
    }
    const local = { ...a, id: Date.now(), createdAt: new Date().toISOString() }
    setAppointments(prev => [local, ...prev])
    return local
  }

  const isSlotTaken = (date, time) =>
    appointments.some(a => a.date === date && a.time === time && a.status !== 'cancelled')

  const cancelAppointment  = (id) => firebaseOn
    ? fsUpdateApptStatus(id, 'cancelled')
    : setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled', paymentStatus: 'refunded' } : a))

  const completeAppointment = (id) => firebaseOn
    ? fsUpdateApptStatus(id, 'completed')
    : setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed', paymentStatus: 'paid' } : a))

  const deleteAppointment = (id) => firebaseOn
    ? fsDeleteAppt(id)
    : setAppointments(prev => prev.filter(a => a.id !== id))

  const updateAppointmentStatus = (id, status) => {
    if (firebaseOn) return fsUpdateApptStatus(id, status)
    const payMap = { completed: 'paid', cancelled: 'refunded', confirmed: 'pending' }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, paymentStatus: payMap[status] ?? a.paymentStatus } : a))
  }

  // ── Fila de Espera ────────────────────────────────────────────
  const addToWaitlist = async (data) => {
    if (firebaseOn) {
      const id = await createWaitlistEntry(data)
      notifyOwner('⏳ Fila de Espera', `${data.clientName} quer ${data.service?.name ?? 'um horário'}`)
      return { ...data, id }
    }
    const entry = { id: Date.now(), createdAt: new Date().toISOString(), notifiedAt: null, wantEarlier: false, ...data }
    setWaitlist(prev => [...prev, entry])
    return entry
  }

  const removeFromWaitlist = (id) => firebaseOn
    ? deleteWaitlistEntry(id)
    : setWaitlist(prev => prev.filter(w => w.id !== id))

  const markWaitlistNotified = (id) => firebaseOn
    ? markNotified(id)
    : setWaitlist(prev => prev.map(w => w.id === id ? { ...w, notifiedAt: new Date().toISOString() } : w))

  const findWaitlistCandidates = ({ date, time, serviceId } = {}) => {
    if (!date || !time) return []
    return waitlist.filter(entry => {
      if (entry.notifiedAt) return false
      if (serviceId && entry.serviceId && String(entry.serviceId) !== String(serviceId)) return false
      if (entry.preferredDate === date && entry.preferredTime === time) return true
      if (entry.wantEarlier && entry.preferredDate) {
        if (date < entry.preferredDate) return true
        if (date === entry.preferredDate && time < entry.preferredTime) return true
      }
      return false
    })
  }

  // ── Galeria ───────────────────────────────────────────────────
  const addGalleryPhoto = (p) => firebaseOn
    ? createGalleryPhoto({ ...p, order: Date.now() })
    : setGallery(prev => [...prev, { ...p, id: Date.now() }])

  const removeGalleryPhoto = (id) => firebaseOn
    ? deleteGalleryPhoto(id)
    : setGallery(prev => prev.filter(g => g.id !== id))

  const updateGalleryPhoto = (id, p) => firebaseOn
    ? fsUpdateGalleryPhoto(id, p)
    : setGallery(prev => prev.map(g => g.id === id ? { ...g, ...p } : g))

  // ── Serviços ──────────────────────────────────────────────────
  const addService    = (s)     => setServices(prev => [...prev, { ...s, id: Date.now() }])
  const removeService = (id)    => setServices(prev => prev.filter(s => s.id !== id))
  const updateService = (id, p) => setServices(prev => prev.map(s => s.id === id ? { ...s, ...p } : s))

  // ── Produtos ──────────────────────────────────────────────────
  const addProduct = (p) => firebaseOn
    ? createProduct({ ...p, inStock: true, stockQty: parseInt(p.stockQty) || 0, order: Date.now() })
    : setProducts(prev => [...prev, { ...p, id: Date.now(), inStock: true, stockQty: parseInt(p.stockQty) || 0 }])

  const removeProduct = (id) => firebaseOn
    ? deleteProduct(id)
    : setProducts(prev => prev.filter(p => p.id !== id))

  const updateProduct = (id, p) => firebaseOn
    ? fsUpdateProduct(id, p)
    : setProducts(prev => prev.map(x => x.id === id ? { ...x, ...p } : x))

  const toggleStock = (id) => {
    if (firebaseOn) {
      const prod = products.find(p => p.id === id)
      if (prod) toggleProductStock(id, prod.inStock)
    } else {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p))
    }
  }

  // ── Banners ───────────────────────────────────────────────────
  const addBanner = (b) => firebaseOn
    ? createBanner({ ...b, order: Date.now() })
    : setBanners(prev => [...prev, { ...b, id: Date.now() }])

  const removeBanner = (id) => firebaseOn
    ? deleteBanner(id)
    : setBanners(prev => prev.filter(b => b.id !== id))

  const updateBanner = (id, p) => firebaseOn
    ? fsUpdateBanner(id, p)
    : setBanners(prev => prev.map(b => b.id === id ? { ...b, ...p } : b))

  // ── Feed ──────────────────────────────────────────────────────
  const addFeedPost = (post) => firebaseOn
    ? createFeedPost(post)
    : setFeedPosts(prev => [{ ...post, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] }, ...prev])

  const removeFeedPost = (id) => firebaseOn
    ? deleteFeedPost(id)
    : setFeedPosts(prev => prev.filter(p => p.id !== id))

  const updateFeedPost = (id, p) => firebaseOn
    ? fsUpdateFeedPost(id, p)
    : setFeedPosts(prev => prev.map(x => x.id === id ? { ...x, ...p } : x))

  // ── Destaques ─────────────────────────────────────────────────
  const addHighlight    = (h)   => setHighlights(prev => [...prev, { ...h, id: Date.now() }])
  const removeHighlight = (id)  => setHighlights(prev => prev.filter(h => h.id !== id))

  // ── Procedimentos ─────────────────────────────────────────────
  const addProcedure = (p) => firebaseOn
    ? createProcedure({ ...p, order: Date.now() })
    : setProcedures(prev => [...prev, { ...p, id: Date.now() }])

  const removeProcedure = (id) => firebaseOn
    ? deleteProcedure(id)
    : setProcedures(prev => prev.filter(p => p.id !== id))

  const updateProcedure = (id, p) => firebaseOn
    ? fsUpdateProcedure(id, p)
    : setProcedures(prev => prev.map(x => x.id === id ? { ...x, ...p } : x))

  // ── Links externos ────────────────────────────────────────────
  const addLink = (l) => firebaseOn
    ? createLink({ ...l, order: Date.now() })
    : setLinks(prev => [...prev, { ...l, id: Date.now() }])

  const removeLink = (id) => firebaseOn
    ? deleteLink(id)
    : setLinks(prev => prev.filter(l => l.id !== id))

  const updateLink = (id, l) => firebaseOn
    ? fsUpdateLink(id, l)
    : setLinks(prev => prev.map(x => x.id === id ? { ...x, ...l } : x))

  // ── Templates WhatsApp ────────────────────────────────────────
  const updateWaTemplate = (status, msg) => setWaTemplates(prev => ({ ...prev, [status]: msg }))

  // ── VIP do cliente ────────────────────────────────────────────
  const normalizePhone = (p) => (p || '').replace(/\D/g, '')

  // Lê VIP do Firestore (usuarios) quando online, fallback pra localStorage
  // Aceita telefone ou email como identificador
  const isVipClient = (phoneOrEmail) => {
    if (firebaseOn) {
      const norm = normalizePhone(phoneOrEmail)
      if (norm) return usuarios.some(u => u.phone === norm && u.isVip)
      if ((phoneOrEmail || '').includes('@')) {
        const e = phoneOrEmail.trim().toLowerCase()
        return usuarios.some(u => (u.email || '').trim().toLowerCase() === e && u.isVip)
      }
      return false
    }
    return (profile.vipPhones || []).includes(phoneOrEmail)
  }

  // VIP do usuário atual — verifica por telefone E por email (cobre login via Google sem telefone)
  const amIVip = useMemo(() => {
    if (!firebaseOn) return (profile.vipPhones || []).includes(profile.phone)
    const norm = normalizePhone(profile.phone)
    const emailNorm = (profile.email || '').trim().toLowerCase()
    return usuarios.some(u => {
      if (!u.isVip) return false
      if (norm && u.phone === norm) return true
      if (emailNorm && (u.email || '').trim().toLowerCase() === emailNorm) return true
      return false
    })
  }, [usuarios, profile, firebaseOn])

  const toggleVip = async (phone) => {
    const norm = normalizePhone(phone)
    const isEmailId = !norm && (phone || '').includes('@')

    if (firebaseOn && (norm || isEmailId)) {
      // Busca o usuário por telefone ou por email (para usuários sem telefone)
      const current = norm
        ? usuarios.find(u => u.phone === norm)
        : usuarios.find(u => u.email === phone)
      const nextVip = !current?.isVip

      // Atualização otimista
      setUsuarios(prev => {
        if (norm) {
          const exists = prev.some(u => u.phone === norm)
          if (exists) return prev.map(u => u.phone === norm ? { ...u, isVip: nextVip } : u)
          return [...prev, { phone: norm, email: current?.email || '', name: current?.name || '', isVip: nextVip }]
        } else {
          const exists = prev.some(u => u.email === phone)
          if (exists) return prev.map(u => u.email === phone ? { ...u, isVip: nextVip } : u)
          return [...prev, { phone: '', email: phone, name: current?.name || '', isVip: nextVip }]
        }
      })

      try {
        if (norm) {
          // Fallback: se a entry não tem email, mas o phone bate com o admin
          // logado, usa profile.email — assim amIVip do dono funciona.
          const fallbackEmail = (norm === normalizePhone(profile.phone)) ? (profile.email || '') : ''
          const email = current?.email || fallbackEmail
          await updateUsuarioVip(norm, nextVip, email)
        } else {
          await updateUsuarioVipByEmail(phone, nextVip)
        }
      } catch (e) {
        console.error('[toggleVip]', e)
        // Reverte em caso de erro
        setUsuarios(prev => {
          if (norm) return prev.map(u => u.phone === norm ? { ...u, isVip: !nextVip } : u)
          return prev.map(u => u.email === phone ? { ...u, isVip: !nextVip } : u)
        })
      }
    } else {
      setProfileState(prev => {
        const list = prev.vipPhones || []
        const next = list.includes(phone) ? list.filter(p => p !== phone) : [...list, phone]
        return { ...prev, vipPhones: next }
      })
    }
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
      return [...prev, { id: Date.now(), productId: product.id, name: product.name, price: product.price, pickupOption, qty: 1 }]
    })
  }
  const removeFromCart  = (id)      => setCart(prev => prev.filter(i => i.id !== id))
  const updateCartQty   = (id, qty) => qty <= 0 ? removeFromCart(id) : setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  const clearCart       = ()        => setCart([])

  // ── Perfil da cliente ─────────────────────────────────────────
  const setProfile = (data) => {
    setProfileState(prev => ({ ...prev, ...data }))
    if (firebaseOn && data.phone) upsertUsuario(data)
  }

  // ── Auth admin ────────────────────────────────────────────────
  const loginAdmin  = (pin) => { if (pin === brandConfig.adminPin) { setIsAdmin(true); return true } return false }
  const logoutAdmin = async () => {
    if (firebaseOn) {
      try { await authSignOut() } catch {}
    } else {
      setIsAdmin(false)
    }
  }

  // ── Clientes (usuários registrados + histórico de agendamentos) ─
  const clients = useMemo(() => {
    const map = {}
    const norm = (p) => (p || '').replace(/\D/g, '')

    // Base: todos que criaram conta no app
    // Primeiro, processa docs com telefone (prioridade) para evitar duplicatas
    const usuariosComTelefone = new Set()
    usuarios.forEach(u => {
      const phone = u.phone || ''
      const email = u.email || ''
      if (!phone) return
      map[phone] = { name: u.name || '', phone, email, appointments: [], totalSpent: 0, lastVisit: '' }
      if (email) usuariosComTelefone.add(email)
    })
    // Depois, docs de email-only (sem telefone) — só adiciona se não há doc de telefone com o mesmo email
    usuarios.forEach(u => {
      const phone = u.phone || ''
      const email = u.email || ''
      if (phone) return  // já processado acima
      if (!email || usuariosComTelefone.has(email)) return  // duplicata ou sem chave
      map[email] = { name: u.name || '', phone: '', email, appointments: [], totalSpent: 0, lastVisit: '' }
    })

    // Mescla agendamentos APENAS em entries existentes (não cria entry de "guest")
    // Regra: só aparece na lista quem logou no app (tem doc em usuarios)
    appointments.forEach(a => {
      const raw = a.clientPhone || ''
      const key = norm(raw) || raw
      if (!key) return
      if (!map[key]) return  // ignora agendamentos sem usuário registrado
      // Se o entry veio do usuarios sem nome, preenche pelo agendamento
      if (!map[key].name && a.clientName) map[key].name = a.clientName
      map[key].appointments.push(a)
      if (a.paymentStatus === 'paid') map[key].totalSpent += (a.service?.price ?? 0)
      if (a.date > map[key].lastVisit) map[key].lastVisit = a.date
    })

    // Mostra todos os usuários logados (com telefone ou email identificável)
    return Object.values(map)
      .filter(c => (c.phone || c.email || '').length > 0)
      .sort((a, b) => {
        if (b.lastVisit && !a.lastVisit) return 1
        if (a.lastVisit && !b.lastVisit) return -1
        return b.lastVisit.localeCompare(a.lastVisit)
      })
  }, [appointments, usuarios])

  // ── Métricas financeiras ──────────────────────────────────────
  const finance = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const nowMonth = todayStr.slice(0, 7)
    const paid = appointments.filter(a => a.paymentStatus === 'paid')
    const todayPaid = paid.filter(a => a.date === todayStr)
    const monthPaid = paid.filter(a => a.date.startsWith(nowMonth))
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
      services, products, banners, highlights, feedPosts, procedures, links, waTemplates,
      appointments, blocks, waitlist, gallery, profile, cart, workingHours, availableHours, isAdmin,
      currentUser, authLoading, firebaseOn, dataLoaded,
      clients, finance,
      addAppointment, cancelAppointment, completeAppointment, deleteAppointment, updateAppointmentStatus,
      isSlotTaken,
      addToWaitlist, removeFromWaitlist, markWaitlistNotified, findWaitlistCandidates,
      addGalleryPhoto, removeGalleryPhoto, updateGalleryPhoto,
      addService, removeService, updateService,
      addProduct, removeProduct, updateProduct, toggleStock,
      addBanner, removeBanner, updateBanner,
      addFeedPost, removeFeedPost, updateFeedPost,
      addHighlight, removeHighlight,
      addProcedure, removeProcedure, updateProcedure,
      addLink, removeLink, updateLink,
      updateWaTemplate,
      isVipClient, toggleVip, amIVip,
      addBlock, removeBlock, updateBlock,
      setProfile,
      addToCart, removeFromCart, updateCartQty, clearCart,
      setWorkingHours,
      resolveImage, registerImage, unregisterImage,
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
