import { useState } from 'react'
import {
  Plus, Pencil, Trash2, Save, Upload, Image as ImageIcon, Layers, Sparkles, ChevronDown, Link as LinkIcon,
  Instagram, Facebook, Music2, MessageCircle, MapPin, Globe, Mail, Phone, Youtube,
  BookOpen, GraduationCap, Megaphone, Camera,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

// ── Upload de imagem inline (acionado por clique) ───────────────────
function ImageUploadField({ value, onChange, label = 'Imagem' }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(60,60,67,0.5)' }}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        {value ? (
          <img
            src={value}
            alt="preview"
            className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
            style={{ border: '1px solid rgba(0,0,0,0.06)' }}
            onError={e => e.target.style.display = 'none'}
          />
        ) : (
          <div
            className="w-20 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(120,120,128,0.08)' }}
          >
            <ImageIcon size={18} strokeWidth={1.5} style={{ color: 'rgba(60,60,67,0.3)' }} />
          </div>
        )}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <label className="cursor-pointer">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-colors"
              style={{ border: '1px solid rgba(60,60,67,0.18)', color: 'rgba(60,60,67,0.7)' }}
            >
              <Upload size={13} strokeWidth={2} />
              Upload de imagem
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) onChange(URL.createObjectURL(file))
              }}
            />
          </label>
          <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(60,60,67,0.3)' }}>
            ou cole a URL abaixo
          </p>
          <input
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder="URL da imagem"
            className="w-full rounded-xl px-3 py-2 text-[12px] focus:outline-none transition-colors"
            style={{ border: '1px solid rgba(60,60,67,0.18)' }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Linha de input genérico ─────────────────────────────────────────
function InputField({ label, value, onChange, placeholder, multiline = false }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(60,60,67,0.5)' }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl px-3 py-2.5 text-[13px] focus:outline-none resize-none transition-colors"
          style={{ border: '1px solid rgba(60,60,67,0.18)' }}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl px-3 py-2.5 text-[13px] focus:outline-none transition-colors"
          style={{ border: '1px solid rgba(60,60,67,0.18)' }}
        />
      )}
    </div>
  )
}

// ── Item Accordion genérico (resumo + edição expansível) ───────────
function AccordionItem({ index, prefix, title, isOpen, onToggle, onDelete, children }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* Linha resumida */}
      <div
        className="flex items-center px-4 py-3 gap-3 transition-colors hover:bg-gray-50"
      >
        <span
          className="text-[9px] font-bold uppercase tracking-widest w-14 flex-shrink-0"
          style={{ color: 'rgba(60,60,67,0.3)' }}
        >
          {prefix} {String(index + 1).padStart(2, '0')}
        </span>
        <span
          className="font-bold text-[13px] flex-1 truncate uppercase"
          style={{ color: '#1D1D1F' }}
        >
          {title || 'Sem título'}
        </span>
        <button
          onClick={onToggle}
          className="text-label-3 hover:text-accent transition-colors flex-shrink-0 p-1"
          aria-label="Editar"
        >
          <Pencil size={15} strokeWidth={1.5} />
        </button>
        <button
          onClick={onDelete}
          className="hover:text-red-400 transition-colors flex-shrink-0 p-1"
          style={{ color: 'rgba(60,60,67,0.25)' }}
          aria-label="Excluir"
        >
          <Trash2 size={15} strokeWidth={1.5} />
        </button>
      </div>

      {/* Form expansível */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="p-4 space-y-4"
              style={{
                borderTop: '1px solid rgba(0,0,0,0.06)',
                background: 'rgba(245,242,237,0.3)',
              }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Cabeçalho de seção (Feed/Banners/Procedimentos) ────────────────
function SectionHeader({ Icon, title, count, onAdd, isExpanded, onToggleExpand }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <button
        onClick={onToggleExpand}
        className="flex items-center gap-2.5 flex-1 min-w-0"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' }}
        >
          <Icon size={15} strokeWidth={1.5} className="text-accent" />
        </div>
        <div className="text-left min-w-0">
          <p className="font-heading text-[15px] font-black uppercase tracking-tight" style={{ color: '#1D1D1F' }}>
            {title}
          </p>
          <p className="text-[11px]" style={{ color: 'rgba(60,60,67,0.5)' }}>{count} item{count !== 1 ? 's' : ''}</p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-1 flex-shrink-0"
        >
          <ChevronDown size={16} strokeWidth={2} style={{ color: 'rgba(60,60,67,0.4)' }} />
        </motion.div>
      </button>

      <button
        onClick={onAdd}
        className="ml-3 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white transition-colors flex-shrink-0"
        style={{ background: 'var(--color-accent)' }}
      >
        <Plus size={12} strokeWidth={2.5} /> Novo
      </button>
    </div>
  )
}

// ── Seção: Procedimentos (carrossel da Home) ───────────────────────
function ProceduresSection() {
  const { procedures, addProcedure, removeProcedure, updateProcedure } = useApp()
  const [openId, setOpenId] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const handleAdd = () => {
    addProcedure({ titulo: '', descricao: '', imagem: '' })
  }

  return (
    <section>
      <SectionHeader
        Icon={Sparkles}
        title="Procedimentos"
        count={procedures.length}
        onAdd={handleAdd}
        isExpanded={expanded}
        onToggleExpand={() => setExpanded(e => !e)}
      />

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {procedures.length === 0 ? (
              <div className="text-center py-8 text-[13px]" style={{ color: 'rgba(60,60,67,0.4)' }}>
                Nenhum procedimento cadastrado
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {procedures.map((p, i) => (
                  <AccordionItem
                    key={p.id}
                    index={i}
                    prefix="Proc."
                    title={p.titulo}
                    isOpen={openId === p.id}
                    onToggle={() => setOpenId(openId === p.id ? null : p.id)}
                    onDelete={() => window.confirm('Remover procedimento?') && removeProcedure(p.id)}
                  >
                    <ImageUploadField
                      value={p.imagem}
                      onChange={v => updateProcedure(p.id, { imagem: v })}
                    />
                    <InputField
                      label="Título"
                      value={p.titulo}
                      onChange={v => updateProcedure(p.id, { titulo: v })}
                      placeholder="Ex: Ozonioterapia"
                    />
                    <InputField
                      label="Descrição"
                      value={p.descricao}
                      onChange={v => updateProcedure(p.id, { descricao: v })}
                      placeholder="Breve descrição do procedimento"
                      multiline
                    />
                    <button
                      onClick={() => setOpenId(null)}
                      className="px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white"
                      style={{ background: 'var(--color-accent)' }}
                    >
                      <Save size={13} strokeWidth={2} className="inline mr-1" /> Fechar
                    </button>
                  </AccordionItem>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ── Seção: Feed ────────────────────────────────────────────────────
function FeedSection() {
  const { feedPosts, services, addFeedPost, removeFeedPost, updateFeedPost } = useApp()
  const [openId, setOpenId] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const handleAdd = () => {
    addFeedPost({ imageUrl: '', title: '', procedure: '', description: '', serviceId: '' })
  }

  return (
    <section>
      <SectionHeader
        Icon={ImageIcon}
        title="Feed"
        count={feedPosts.length}
        onAdd={handleAdd}
        isExpanded={expanded}
        onToggleExpand={() => setExpanded(e => !e)}
      />

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {feedPosts.length === 0 ? (
              <div className="text-center py-8 text-[13px]" style={{ color: 'rgba(60,60,67,0.4)' }}>
                Nenhuma postagem
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {feedPosts.map((post, i) => (
                  <AccordionItem
                    key={post.id}
                    index={i}
                    prefix="Post"
                    title={post.title}
                    isOpen={openId === post.id}
                    onToggle={() => setOpenId(openId === post.id ? null : post.id)}
                    onDelete={() => window.confirm('Remover postagem?') && removeFeedPost(post.id)}
                  >
                    <ImageUploadField
                      value={post.imageUrl}
                      onChange={v => updateFeedPost(post.id, { imageUrl: v })}
                    />
                    <InputField
                      label="Título"
                      value={post.title}
                      onChange={v => updateFeedPost(post.id, { title: v })}
                      placeholder="Título da postagem"
                    />
                    <InputField
                      label="Procedimento"
                      value={post.procedure}
                      onChange={v => updateFeedPost(post.id, { procedure: v })}
                      placeholder="Ex: Volume Russo"
                    />
                    <InputField
                      label="Descrição"
                      value={post.description}
                      onChange={v => updateFeedPost(post.id, { description: v })}
                      placeholder="Texto opcional de apoio"
                      multiline
                    />
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(60,60,67,0.5)' }}>
                        Serviço Vinculado
                      </label>
                      <select
                        value={post.serviceId || ''}
                        onChange={e => updateFeedPost(post.id, { serviceId: e.target.value })}
                        className="w-full rounded-xl px-3 py-2.5 text-[13px] focus:outline-none"
                        style={{ border: '1px solid rgba(60,60,67,0.18)', background: 'white' }}
                      >
                        <option value="">— Nenhum —</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={() => setOpenId(null)}
                      className="px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white"
                      style={{ background: 'var(--color-accent)' }}
                    >
                      <Save size={13} strokeWidth={2} className="inline mr-1" /> Fechar
                    </button>
                  </AccordionItem>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ── Seção: Banners ─────────────────────────────────────────────────
function BannersSection() {
  const { banners, services, products, addBanner, removeBanner, updateBanner } = useApp()
  const [openId, setOpenId] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const handleAdd = () => {
    addBanner({ url: '', title: '', subtitle: '', ctaLabel: '', ctaType: 'scheduling', ctaTarget: '', vipOnly: false })
  }

  return (
    <section>
      <SectionHeader
        Icon={Layers}
        title="Banners"
        count={banners.length}
        onAdd={handleAdd}
        isExpanded={expanded}
        onToggleExpand={() => setExpanded(e => !e)}
      />

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {banners.length === 0 ? (
              <div className="text-center py-8 text-[13px]" style={{ color: 'rgba(60,60,67,0.4)' }}>
                Nenhum banner cadastrado
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {banners.map((b, i) => (
                  <AccordionItem
                    key={b.id}
                    index={i}
                    prefix="Banner"
                    title={b.title}
                    isOpen={openId === b.id}
                    onToggle={() => setOpenId(openId === b.id ? null : b.id)}
                    onDelete={() => window.confirm('Remover banner?') && removeBanner(b.id)}
                  >
                    <ImageUploadField
                      value={b.url}
                      onChange={v => updateBanner(b.id, { url: v })}
                    />
                    <InputField
                      label="Título"
                      value={b.title}
                      onChange={v => updateBanner(b.id, { title: v })}
                      placeholder="Ex: Realce sua beleza natural"
                    />
                    <InputField
                      label="Subtítulo"
                      value={b.subtitle}
                      onChange={v => updateBanner(b.id, { subtitle: v })}
                      placeholder="Texto complementar"
                    />

                    {/* Configuração do CTA */}
                    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(60,60,67,0.5)' }}>
                        Botão de Ação (CTA)
                      </p>
                      <div className="flex flex-col gap-3">
                        <InputField
                          label="Texto do botão"
                          value={b.ctaLabel || ''}
                          onChange={v => updateBanner(b.id, { ctaLabel: v })}
                          placeholder="Ex: Agendar agora"
                        />
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(60,60,67,0.5)' }}>
                            Destino
                          </label>
                          <select
                            value={b.ctaType || 'scheduling'}
                            onChange={e => updateBanner(b.id, { ctaType: e.target.value, ctaTarget: '' })}
                            className="w-full rounded-xl px-3 py-2.5 text-[13px] focus:outline-none"
                            style={{ border: '1px solid rgba(60,60,67,0.18)', background: 'white' }}
                          >
                            <option value="scheduling">Página de Agendamento</option>
                            <option value="service">Serviço específico</option>
                            <option value="product">Produto da Loja</option>
                          </select>
                        </div>
                        {b.ctaType === 'service' && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(60,60,67,0.5)' }}>
                              Serviço
                            </label>
                            <select
                              value={b.ctaTarget || ''}
                              onChange={e => updateBanner(b.id, { ctaTarget: e.target.value })}
                              className="w-full rounded-xl px-3 py-2.5 text-[13px] focus:outline-none"
                              style={{ border: '1px solid rgba(60,60,67,0.18)', background: 'white' }}
                            >
                              <option value="">— Selecione —</option>
                              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                        )}
                        {b.ctaType === 'product' && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(60,60,67,0.5)' }}>
                              Produto
                            </label>
                            <select
                              value={b.ctaTarget || ''}
                              onChange={e => updateBanner(b.id, { ctaTarget: e.target.value })}
                              className="w-full rounded-xl px-3 py-2.5 text-[13px] focus:outline-none"
                              style={{ border: '1px solid rgba(60,60,67,0.18)', background: 'white' }}
                            >
                              <option value="">— Selecione —</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Toggle VIP only */}
                    <label
                      className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
                      style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${b.vipOnly ? '#D4AF37' : 'rgba(0,0,0,0.05)'}` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: '#D4AF37', color: '#fff' }}>VIP</span>
                        <span className="text-[12px] font-medium" style={{ color: '#1D1D1F' }}>Visível só para clientes VIP</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={!!b.vipOnly}
                        onChange={e => updateBanner(b.id, { vipOnly: e.target.checked })}
                        className="w-5 h-5"
                        style={{ accentColor: '#D4AF37' }}
                      />
                    </label>

                    <button
                      onClick={() => setOpenId(null)}
                      className="px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white"
                      style={{ background: 'var(--color-accent)' }}
                    >
                      <Save size={13} strokeWidth={2} className="inline mr-1" /> Fechar
                    </button>
                  </AccordionItem>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ── Seção: Links externos ────────────────────────────────────────
const LINK_ICON_GALLERY = [
  { key: 'Instagram',     Icon: Instagram,     label: 'Instagram'  },
  { key: 'Facebook',      Icon: Facebook,      label: 'Facebook'   },
  { key: 'Music2',        Icon: Music2,        label: 'TikTok'     },
  { key: 'Youtube',       Icon: Youtube,       label: 'YouTube'    },
  { key: 'MessageCircle', Icon: MessageCircle, label: 'WhatsApp'   },
  { key: 'Phone',         Icon: Phone,         label: 'Telefone'   },
  { key: 'Mail',          Icon: Mail,          label: 'E-mail'     },
  { key: 'MapPin',        Icon: MapPin,        label: 'Localização' },
  { key: 'Globe',         Icon: Globe,         label: 'Site'       },
  { key: 'BookOpen',      Icon: BookOpen,      label: 'E-book'     },
  { key: 'GraduationCap', Icon: GraduationCap, label: 'Cursos'     },
  { key: 'Megaphone',     Icon: Megaphone,     label: 'Avisos'     },
]

// Galeria visual de ícones (substitui o dropdown)
function IconGallery({ value, onChange }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(60,60,67,0.5)' }}>
        Ícone
      </label>
      <div className="grid grid-cols-4 gap-2">
        {LINK_ICON_GALLERY.map(({ key, Icon, label }) => {
          const active = value === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all"
              style={{
                background: active ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)' : 'rgba(120,120,128,0.06)',
                border: `1.5px solid ${active ? 'var(--color-accent)' : 'transparent'}`,
              }}
              aria-label={label}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5}
                style={{ color: active ? 'var(--color-accent)' : 'rgba(60,60,67,0.6)' }} />
              <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-full px-1"
                style={{ color: active ? 'var(--color-accent)' : 'rgba(60,60,67,0.5)' }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LinksSection() {
  const { links, addLink, removeLink, updateLink } = useApp()
  const [openId, setOpenId] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const handleAdd = () => {
    addLink({ label: '', url: '', icon: 'Globe' })
  }

  return (
    <section>
      <SectionHeader
        Icon={LinkIcon}
        title="Links Externos"
        count={links.length}
        onAdd={handleAdd}
        isExpanded={expanded}
        onToggleExpand={() => setExpanded(e => !e)}
      />

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {links.length === 0 ? (
              <div className="text-center py-8 text-[13px]" style={{ color: 'rgba(60,60,67,0.4)' }}>
                Nenhum link cadastrado
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {links.map((l, i) => (
                  <AccordionItem
                    key={l.id}
                    index={i}
                    prefix="Link"
                    title={l.label}
                    isOpen={openId === l.id}
                    onToggle={() => setOpenId(openId === l.id ? null : l.id)}
                    onDelete={() => window.confirm('Remover link?') && removeLink(l.id)}
                  >
                    <InputField
                      label="Nome"
                      value={l.label}
                      onChange={v => updateLink(l.id, { label: v })}
                      placeholder="Ex: Instagram"
                    />
                    <InputField
                      label="URL"
                      value={l.url}
                      onChange={v => updateLink(l.id, { url: v })}
                      placeholder="https://..."
                    />
                    <IconGallery
                      value={l.icon || 'Globe'}
                      onChange={v => updateLink(l.id, { icon: v })}
                    />
                    <button
                      onClick={() => setOpenId(null)}
                      className="px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white"
                      style={{ background: 'var(--color-accent)' }}
                    >
                      <Save size={13} strokeWidth={2} className="inline mr-1" /> Fechar
                    </button>
                  </AccordionItem>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ── Seção: Nosso Ambiente (galeria de fotos do studio) ────────────
function GallerySection() {
  const { gallery, addGalleryPhoto, removeGalleryPhoto, updateGalleryPhoto } = useApp()
  const [openId, setOpenId] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const handleAdd = () => {
    addGalleryPhoto({ url: '', caption: '' })
  }

  return (
    <section>
      <SectionHeader
        Icon={Camera}
        title="Nosso Ambiente"
        count={gallery.length}
        onAdd={handleAdd}
        isExpanded={expanded}
        onToggleExpand={() => setExpanded(e => !e)}
      />

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {gallery.length === 0 ? (
              <div className="text-center py-8 text-[13px]" style={{ color: 'rgba(60,60,67,0.4)' }}>
                Nenhuma foto cadastrada
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {gallery.map((g, i) => (
                  <AccordionItem
                    key={g.id}
                    index={i}
                    prefix="Foto"
                    title={g.caption || '(sem legenda)'}
                    isOpen={openId === g.id}
                    onToggle={() => setOpenId(openId === g.id ? null : g.id)}
                    onDelete={() => window.confirm('Remover esta foto?') && removeGalleryPhoto(g.id)}
                  >
                    <ImageUploadField
                      value={g.url}
                      onChange={v => updateGalleryPhoto(g.id, { url: v })}
                    />
                    <InputField
                      label="Legenda"
                      value={g.caption}
                      onChange={v => updateGalleryPhoto(g.id, { caption: v })}
                      placeholder="Ex: Recepção, Sala de procedimentos…"
                    />
                    <button
                      onClick={() => setOpenId(null)}
                      className="px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white"
                      style={{ background: 'var(--color-accent)' }}
                    >
                      <Save size={13} strokeWidth={2} className="inline mr-1" /> Fechar
                    </button>
                  </AccordionItem>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ── Página principal ──────────────────────────────────────────────
export default function HomeAdmin() {
  return (
    <div className="px-4 pt-5 flex flex-col gap-7 pb-6 max-w-3xl mx-auto w-full">
      <FeedSection />
      <BannersSection />
      <ProceduresSection />
      <GallerySection />
      <LinksSection />
    </div>
  )
}
