import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, MapPin, ExternalLink, X, Crown,
  Instagram, Facebook, Music2, MessageCircle, Globe, Mail, Phone, Youtube,
  BookOpen, GraduationCap, Megaphone,
} from 'lucide-react'
import { brandConfig } from '../brandConfig'
import { useApp } from '../context/AppContext'

// Mapa de ícones permitidos para a seção Links (mantém o bundle enxuto)
const LINK_ICONS = {
  Instagram, Facebook, Music2, MessageCircle, MapPin, Globe, Mail, Phone, Youtube,
  BookOpen, GraduationCap, Megaphone,
}

// ── Banner Carrossel com swipe lateral (drag via Framer Motion) ──
function HeroBanner({ banners, onCtaClick, resolveImage }) {
  const [idx, setIdx] = useState(0)
  const containerRef = useRef(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(window.innerWidth >= 768 ? 400 : 240)
  const [imgErrors, setImgErrors] = useState({})
  const total = banners.length

  // Pega largura/altura do container e atualiza em resize
  useEffect(() => {
    const update = () => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth)
      setHeight(window.innerWidth >= 768 ? 400 : 240)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [banners])

  // Auto-advance
  useEffect(() => {
    if (total < 2) return
    const t = setInterval(() => setIdx(prev => (prev + 1) % total), 5500)
    return () => clearInterval(t)
  }, [total])

  const handleDragEnd = (_, info) => {
    const T = 60
    if (info.offset.x < -T && idx < total - 1) setIdx(idx + 1)
    else if (info.offset.x > T && idx > 0) setIdx(idx - 1)
  }

  // Placeholder elegante quando ainda não há banners cadastrados
  if (!total) {
    return (
      <div
        className="mx-4 relative flex flex-col items-center justify-center text-center px-6"
        style={{
          borderRadius: 24,
          height: 240,
          background: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-bg))',
          border: '1.5px dashed color-mix(in srgb, var(--color-accent) 35%, transparent)',
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'color-mix(in srgb, var(--color-accent) 18%, transparent)' }}
        >
          <span style={{ fontSize: 22 }}>✨</span>
        </div>
        <p
          className="font-heading text-[16px] font-bold uppercase tracking-tight mb-1"
          style={{ color: 'var(--color-accent)' }}
        >
          Seu banner promocional aqui
        </p>
        <p className="text-[12px]" style={{ color: 'rgba(60,60,67,0.55)' }}>
          Adicione no Painel Admin → Home
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="mx-4 md:mx-6 relative"
      style={{ borderRadius: 24, overflow: 'hidden', height }}
    >
      <motion.div
        className="flex h-full"
        drag={total > 1 ? 'x' : false}
        dragConstraints={{ left: -(total - 1) * width, right: 0 }}
        dragElastic={0.18}
        onDragEnd={handleDragEnd}
        animate={{ x: -idx * width }}
        transition={{ type: 'spring', stiffness: 320, damping: 36 }}
      >
        {banners.map(banner => (
          <div
            key={banner.id}
            className="relative flex-shrink-0 h-full"
            style={{ width }}
          >
            {imgErrors[banner.id] ? (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--color-accent) 18%, var(--color-bg))' }}
              />
            ) : (
              <picture className="w-full h-full">
                {banner.urlDesktop && resolveImage(banner.urlDesktop) && (
                  <source media="(min-width: 768px)" srcSet={resolveImage(banner.urlDesktop)} />
                )}
                {resolveImage(banner.url) ? (
                  <img
                    src={resolveImage(banner.url)}
                    alt={banner.title}
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none"
                    style={{ objectPosition: banner.objectPosition || 'center' }}
                    onError={() => setImgErrors(prev => ({ ...prev, [banner.id]: true }))}
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-bg))' }}
                  />
                )}
              </picture>
            )}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }}
            />
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              {banner.vipOnly && (
                <span
                  className="self-start mb-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: '#D4AF37', color: '#fff' }}
                >
                  VIP
                </span>
              )}
              <p className="text-white/60 text-[11px] font-semibold uppercase tracking-[0.14em] mb-1">
                {brandConfig.studioName}
              </p>
              <h2 className="font-heading text-[22px] font-bold text-white leading-tight tracking-tight">
                {banner.title}
              </h2>
              <p className="text-white/70 text-[13px] mt-0.5">{banner.subtitle}</p>

              {!!banner.ctaLabel && (banner.ctaType === 'scheduling' || !!banner.ctaTarget) && (
                <button
                  onClick={(e) => { e.stopPropagation(); onCtaClick(banner) }}
                  className="self-start mt-3 px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest text-accent transition-transform active:scale-95"
                  style={{ background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}
                >
                  {banner.ctaLabel}
                </button>
              )}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Dots */}
      <div className="absolute top-4 right-4 flex gap-1.5 pointer-events-none">
        {banners.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === idx ? 18 : 5,
              height: 5,
              background: i === idx ? '#fff' : 'rgba(255,255,255,0.45)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Seção "Nossos Procedimentos" — carrossel lateral ─────────
function ProceduresSection({ procedures, onNavigate, resolveImage }) {
  if (!procedures?.length) return null

  return (
    <section className="mt-7 py-10" style={{ background: 'var(--color-accent)' }}>
      <div className="text-center text-white px-4 mb-6">
        <h2 className="font-headline text-[22px] font-bold uppercase tracking-tight mb-2">
          Nossos procedimentos
        </h2>
        <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Vamos criar um protocolo exclusivo, personalizado para você.
        </p>
      </div>

      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth pt-3 pb-6"
        style={{ paddingLeft: '7.5vw', paddingRight: '7.5vw' }}
      >
        {procedures.map(p => (
          <div
            key={p.id}
            className="flex-shrink-0 snap-center bg-white rounded-xl overflow-hidden flex flex-col text-left"
            style={{ width: '85vw', maxWidth: 360, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}
          >
            <div className="h-44 overflow-hidden">
              {resolveImage(p.imagem) ? (
                <img alt={p.titulo} className="w-full h-full object-cover"
                  style={{ objectPosition: p.objectPosition || '50% 50%' }} src={resolveImage(p.imagem)} />
              ) : (
                <div className="w-full h-full" style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-bg))' }} />
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-headline text-[15px] font-bold mb-2 uppercase tracking-wide text-accent">
                {p.titulo}
              </h3>
              <p className="text-[13px] leading-relaxed font-medium flex-1"
                style={{ color: 'rgba(74,69,70,0.8)' }}>
                {p.descricao}
              </p>
              {p.serviceId && (
                <button
                  onClick={() => onNavigate('scheduling', { selectedServiceId: String(p.serviceId) })}
                  className="mt-4 self-center text-[11px] font-bold px-4 py-2 rounded-lg"
                  style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)', border: '1.5px solid var(--color-accent)' }}
                >
                  Agendar este procedimento
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}

// ── Card do Feed — só a foto, clique abre modal ──────────────────
function FeedCard({ post, onClick, resolveImage }) {
  return (
    <motion.div
      className="relative overflow-hidden cursor-pointer flex-shrink-0 snap-center"
      style={{ width: 160, aspectRatio: '3/4', borderRadius: 18 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(post)}
    >
      {post.imageUrl && resolveImage(post.imageUrl) ? (
        <img
          src={resolveImage(post.imageUrl)}
          alt={post.procedure || post.title}
          className="w-full h-full object-cover"
          style={{ objectPosition: post.objectPosition || '50% 50%' }}
        />
      ) : (
        <div className="w-full h-full" style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))' }} />
      )}
    </motion.div>
  )
}

// ── Modal que abre ao clicar no card do feed ──────────────────────
function FeedModal({ post, onClose, onNavigate, resolveImage }) {
  if (!post) return null
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-md z-10"
          style={{ background: 'var(--color-surface)', borderRadius: '28px 28px 0 0' }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onClick={e => e.stopPropagation()}
        >
          {post.imageUrl && resolveImage(post.imageUrl) && (
            <div className="relative overflow-hidden" style={{ height: 300, borderRadius: '28px 28px 0 0' }}>
              <img src={resolveImage(post.imageUrl)} alt={post.title}
                className="w-full h-full object-cover"
                style={{ objectPosition: post.objectPosition || '50% 50%' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <button onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <X size={16} strokeWidth={2} className="text-white" />
              </button>
            </div>
          )}
          <div className="p-5 pb-8">
            {post.procedure && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-label-2 mb-1">{post.procedure}</p>
            )}
            {post.title && (
              <h2 className="font-heading text-[20px] font-bold text-label tracking-tight leading-tight">{post.title}</h2>
            )}
            {post.description && (
              <p className="text-[14px] text-label-2 mt-2 leading-relaxed">{post.description}</p>
            )}
            {post.serviceId && (
              <button
                onClick={() => { onNavigate('scheduling', { selectedServiceId: String(post.serviceId) }); onClose() }}
                className="btn-fill w-full mt-4"
              >
                Agendar
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Conecte-se (grid de quadradinhos compactos) ─────────────────
function LinksSection({ links }) {
  if (!links?.length) return null

  return (
    <section className="mt-7 px-4">
      <h2 className="section-label mb-4">Conecte-se</h2>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
        {links.map(l => {
          const Icon = LINK_ICONS[l.icon] ?? ExternalLink
          return (
            <motion.a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.94 }}
              className="aspect-square rounded-2xl bg-white flex flex-col items-center justify-center gap-1.5"
              style={{
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.035)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' }}
              >
                <Icon size={17} strokeWidth={1.75} className="text-accent" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-label-2 truncate max-w-full px-1.5">
                {l.label}
              </span>
            </motion.a>
          )
        })}
      </div>
    </section>
  )
}

// ── "Nosso Ambiente" — só a galeria (localização foi movida pro fim) ─
function EnvironmentSection({ gallery, resolveImage }) {
  return (
    <section className="mt-7">
      <div className="px-4 mb-3">
        <h2 className="section-label">Nosso Ambiente</h2>
        <p className="text-[12px] text-label-2 mt-0.5">Conheça o espaço</p>
      </div>

      {gallery?.length > 0 ? (
        <>
          {/* Mobile: scroll horizontal | Desktop: grid 2 colunas centralizado */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 pb-1 md:hidden">
            {gallery.map(g => (
              <div
                key={g.id}
                className="flex-shrink-0 snap-center relative overflow-hidden bg-white"
                style={{ width: 220, aspectRatio: '4/5', borderRadius: 18, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              >
                {resolveImage(g.url) ? (
                  <img src={resolveImage(g.url)} alt={g.caption || 'Ambiente'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg))' }} />
                )}
                {g.caption && (
                  <>
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
                    <p className="absolute bottom-3 left-3 right-3 text-white text-[12px] font-semibold leading-tight">
                      {g.caption}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4 md:px-6">
            {gallery.map(g => (
              <div
                key={g.id}
                className="relative overflow-hidden bg-white"
                style={{ aspectRatio: '4/5', borderRadius: 18, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              >
                {resolveImage(g.url) ? (
                  <img src={resolveImage(g.url)} alt={g.caption || 'Ambiente'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg))' }} />
                )}
                {g.caption && (
                  <>
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
                    <p className="absolute bottom-3 left-3 right-3 text-white text-[12px] font-semibold leading-tight">
                      {g.caption}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="px-4">
          <div className="rounded-2xl py-8 text-center" style={{ background: 'rgba(120,120,128,0.06)' }}>
            <p className="text-[12px] text-label-2">Nenhuma foto cadastrada ainda</p>
          </div>
        </div>
      )}
    </section>
  )
}

// ── "Onde estamos" — seção de localização (vai pro final do app) ─
function LocationSection() {
  const [mapOpen, setMapOpen] = useState(false)

  return (
    <section className="mt-7 px-4">
      <button onClick={() => setMapOpen(o => !o)} className="w-full ios-section text-left">
        <div className="ios-row">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'color-mix(in srgb, var(--color-accent) 14%, transparent)' }}
          >
            <MapPin size={16} strokeWidth={1.5} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-label-2">Onde estamos</p>
            <p className="text-[15px] font-medium text-label truncate">{brandConfig.address}</p>
          </div>
          <motion.div animate={{ rotate: mapOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={16} strokeWidth={1.5} className="text-label-3" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {mapOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 10 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="ios-card overflow-hidden" style={{ height: 200, borderRadius: 20 }}>
              <iframe
                title="Localização do Studio"
                src={brandConfig.mapsEmbedUrl}
                width="100%"
                height="100%"
                loading="lazy"
                style={{ border: 'none', display: 'block' }}
                allowFullScreen
              />
            </div>
            <button
              onClick={() => window.open(brandConfig.mapsUrl, '_blank')}
              className="mt-2 w-full py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider text-accent"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 8%, transparent)' }}
            >
              Abrir no Google Maps
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ── Fita VIP — aparece só para clientes VIP ───────────────────────
function VipRibbon({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-4 mb-3 relative overflow-hidden rounded-2xl flex items-center gap-3 px-4 py-3"
      style={{
        background: 'linear-gradient(105deg, #BF953F 0%, #FCF6BA 40%, #D4AF37 70%, #AA771C 100%)',
        boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
      }}
    >
      {/* Brilho diagonal */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(115deg, rgba(255,255,255,0.35) 0%, transparent 50%)',
        }}
      />
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.25)' }}
      >
        <Crown size={16} strokeWidth={2} style={{ color: '#7A5A00' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(90,60,0,0.7)' }}>
          Acesso exclusivo
        </p>
        <p className="text-[13px] font-bold leading-tight" style={{ color: '#3A2800' }}>
          {name ? `Bem-vinda, ${name.split(' ')[0]}! ✨` : 'Você é cliente VIP ✨'}
        </p>
      </div>
      <span
        className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.3)', color: '#5A3800' }}
      >
        VIP
      </span>
    </motion.div>
  )
}

// ── Página Home ───────────────────────────────────────────────────
export default function Home({ onNavigate }) {
  const { banners, feedPosts, procedures, links, gallery, amIVip, resolveImage, profile } = useApp()
  const isVip = amIVip
  const [feedModal, setFeedModal] = useState(null)

  // Filtra banners VIP para clientes não-VIP
  const visibleBanners = banners.filter(b => !b.vipOnly || isVip)

  // Roteamento do CTA do banner — passa serviceId/productId via state da rota
  const handleBannerCta = (banner) => {
    if (banner.ctaType === 'product') {
      onNavigate('catalog', { selectedProductId: banner.ctaTarget })
    } else if (banner.ctaType === 'service' && banner.ctaTarget) {
      onNavigate('scheduling', { selectedServiceId: String(banner.ctaTarget) })
    } else {
      onNavigate('scheduling')
    }
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="pt-4" />

      {/* Fita VIP — só para clientes VIP */}
      {isVip && <VipRibbon name={profile.name} />}

      {/* Banner com swipe + CTA dinâmico (filtra VIP) */}
      <HeroBanner banners={visibleBanners} onCtaClick={handleBannerCta} resolveImage={resolveImage} />

      {/* Feed — scroll horizontal no mobile, grid 2 colunas no desktop */}
      {feedPosts.length > 0 && (
        <section className="mt-7">
          <div className="section-header px-4 mb-3">
            <h2 className="section-label">Feed</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 pb-1 md:hidden">
            {feedPosts.map(post => (
              <FeedCard key={post.id} post={post} onClick={setFeedModal} resolveImage={resolveImage} />
            ))}
          </div>
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4 md:px-6">
            {feedPosts.map(post => (
              <motion.div
                key={post.id}
                className="relative overflow-hidden cursor-pointer"
                style={{ aspectRatio: '3/4', borderRadius: 18 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFeedModal(post)}
              >
                {post.imageUrl && resolveImage(post.imageUrl) ? (
                  <img
                    src={resolveImage(post.imageUrl)}
                    alt={post.procedure || post.title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: post.objectPosition || '50% 50%' }}
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))' }} />
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Modal do feed */}
      <FeedModal post={feedModal} onClose={() => setFeedModal(null)} onNavigate={onNavigate} resolveImage={resolveImage} />

      {/* Nossos Procedimentos — carrossel lateral em fundo accent */}
      <ProceduresSection procedures={procedures} onNavigate={onNavigate} resolveImage={resolveImage} />

      {/* Nosso Ambiente — galeria + localização colapsável */}
      <EnvironmentSection gallery={gallery} resolveImage={resolveImage} />

      {/* Conecte-se (quadradinhos compactos) */}
      <LinksSection links={links} />

      {/* Onde estamos — sempre no final */}
      <LocationSection />

      {/* Espaço final */}
      <div className="h-6" />
    </div>
  )
}
