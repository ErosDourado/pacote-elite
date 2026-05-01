import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight, MapPin, ExternalLink,
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
function HeroBanner({ banners, onCtaClick }) {
  const [idx, setIdx] = useState(0)
  const containerRef = useRef(null)
  const [width, setWidth] = useState(0)
  const [imgErrors, setImgErrors] = useState({})
  const total = banners.length

  // Pega largura do container e atualiza em resize
  useEffect(() => {
    const update = () => {
      if (containerRef.current) setWidth(containerRef.current.offsetWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

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
      className="mx-4 relative"
      style={{ borderRadius: 24, overflow: 'hidden', height: 240 }}
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
              <img
                src={banner.url}
                alt={banner.title}
                draggable={false}
                className="w-full h-full object-cover pointer-events-none"
                onError={() => setImgErrors(prev => ({ ...prev, [banner.id]: true }))}
              />
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
function ProceduresSection({ procedures, onAgendar }) {
  // Esconde a seção inteira quando não há procedimentos cadastrados
  if (!procedures?.length) return null

  return (
    <section
      className="mt-7 py-10"
      style={{ background: 'var(--color-accent)' }}
    >
      <div className="text-center text-white px-4 mb-6">
        <h2 className="font-headline text-[22px] font-bold uppercase tracking-tight mb-2">
          Nossos procedimentos
        </h2>
        <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Vamos criar um protocolo exclusivo, personalizado para você.
        </p>
      </div>

      {/* Carrossel com efeito peeking — card central + slivers nas bordas */}
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth pt-3 pb-6"
        style={{ paddingLeft: '7.5vw', paddingRight: '7.5vw' }}
      >
        {procedures.map(p => (
          <div
            key={p.id}
            className="flex-shrink-0 snap-center bg-white rounded-xl overflow-hidden flex flex-col text-left"
            style={{
              width: '85vw',
              maxWidth: 360,
              boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
            }}
          >
            <div className="h-44 overflow-hidden">
              <img alt={p.titulo} className="w-full h-full object-cover" src={p.imagem} />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-headline text-[15px] font-bold mb-3 uppercase tracking-wide text-accent">
                {p.titulo}
              </h3>
              <p
                className="text-[13px] leading-relaxed font-medium flex-1"
                style={{ color: 'rgba(74,69,70,0.8)' }}
              >
                {p.descricao}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center px-4">
        <button
          onClick={onAgendar}
          className="inline-block bg-white text-accent px-8 py-3.5 rounded-md font-bold text-[12px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
        >
          Agende uma avaliação
        </button>
      </div>
    </section>
  )
}

// ── Card do Feed (scroll horizontal, formato retrato) ────────────
function FeedCard({ post }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <motion.div
      className="relative overflow-hidden cursor-pointer flex-shrink-0 snap-center"
      style={{ width: 160, aspectRatio: '3/4', borderRadius: 18 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => setRevealed(r => !r)}
    >
      {post.imageUrl ? (
        <img
          src={post.imageUrl}
          alt={post.procedure || post.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full" style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))' }} />
      )}

      {/* Gradiente fixo sutil na base */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)' }}
      />

      <AnimatePresence>
        {revealed && (
          <motion.div
            className="absolute inset-0 flex items-end p-3"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.22) 55%, transparent 100%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-white text-[12px] font-semibold leading-snug">
              {post.procedure || post.title}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Conecte-se (grid de quadradinhos compactos) ─────────────────
function LinksSection({ links }) {
  if (!links?.length) return null

  return (
    <section className="mt-7 px-4">
      <h2 className="section-label mb-4">Conecte-se</h2>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
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

// ── "Nosso Ambiente" — galeria do studio + localização colapsável ─
function EnvironmentSection({ gallery }) {
  const [mapOpen, setMapOpen] = useState(false)

  return (
    <section className="mt-7">
      {/* Galeria */}
      <div className="px-4 mb-3">
        <h2 className="section-label">Nosso Ambiente</h2>
        <p className="text-[12px] text-label-2 mt-0.5">Conheça o espaço</p>
      </div>

      {gallery?.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 pb-1">
          {gallery.map(g => (
            <div
              key={g.id}
              className="flex-shrink-0 snap-center relative overflow-hidden bg-white"
              style={{ width: 220, aspectRatio: '4/5', borderRadius: 18, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              <img src={g.url} alt={g.caption || 'Ambiente'} className="w-full h-full object-cover" />
              {g.caption && (
                <>
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }}
                  />
                  <p className="absolute bottom-3 left-3 right-3 text-white text-[12px] font-semibold leading-tight">
                    {g.caption}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4">
          <div
            className="rounded-2xl py-8 text-center"
            style={{ background: 'rgba(120,120,128,0.06)' }}
          >
            <p className="text-[12px] text-label-2">Nenhuma foto cadastrada ainda</p>
          </div>
        </div>
      )}

      {/* Localização — colapsável (só mostra mapa ao clicar) */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setMapOpen(o => !o)}
          className="w-full ios-section text-left"
        >
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
            <motion.div
              animate={{ rotate: mapOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
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
              <div
                className="ios-card overflow-hidden"
                style={{ height: 200, borderRadius: 20 }}
              >
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
      </div>
    </section>
  )
}

// ── Página Home ───────────────────────────────────────────────────
export default function Home({ onNavigate }) {
  const { banners, feedPosts, procedures, links, gallery, profile, isVipClient } = useApp()
  const isVip = profile.phone ? isVipClient(profile.phone) : false

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
    <div>
      <div className="pt-4" />

      {/* Banner com swipe + CTA dinâmico (filtra VIP) */}
      <HeroBanner banners={visibleBanners} onCtaClick={handleBannerCta} />

      {/* Feed — scroll horizontal com cards retrato (vem antes dos procedimentos) */}
      {feedPosts.length > 0 && (
        <section className="mt-7">
          <div className="section-header px-4 mb-3">
            <h2 className="section-label">Feed</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 pb-1">
            {feedPosts.map(post => (
              <FeedCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Nossos Procedimentos — carrossel lateral em fundo accent */}
      <ProceduresSection procedures={procedures} onAgendar={() => onNavigate('scheduling')} />

      {/* Nosso Ambiente — galeria + localização colapsável */}
      <EnvironmentSection gallery={gallery} />

      {/* Conecte-se (quadradinhos compactos) */}
      <LinksSection links={links} />

      {/* Espaço final */}
      <div className="h-6" />
    </div>
  )
}
