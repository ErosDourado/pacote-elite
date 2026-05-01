// ╔══════════════════════════════════════════════════════════════════╗
// ║            BRAND CONFIG — Template Mestre v2.0 (iOS)            ║
// ║  Duplique esta pasta e edite apenas este arquivo por cliente    ║
// ╚══════════════════════════════════════════════════════════════════╝

export const brandConfig = {

  // ─── IDENTIDADE ─────────────────────────────────────────────────
  studioName:  'Studio Belle',
  tagline:     'Beauty & Wellness',
  logoUrl:     null, // '/logo.svg' ou null para exibir o nome em texto

  // ─── CORES ──────────────────────────────────────────────────────
  // primary   → cor de ação principal (botões, ícones ativos, destaques)
  // secondary → cor de ações secundárias / texto de apoio
  // background→ fundo das páginas
  // surface   → fundo dos cards e superfícies elevadas
  colors: {
    primary:    '#C9A96E',   // Rose gold / brand accent
    secondary:  '#86868B',   // iOS secondary label
    background: '#F2F2F7',   // iOS system grouped background
    surface:    '#FFFFFF',   // iOS surface / cards
  },

  // ─── TIPOGRAFIA ─────────────────────────────────────────────────
  font: {
    heading: 'Montserrat',
    body:    'Montserrat',
  },

  // ─── CONTATO ────────────────────────────────────────────────────
  whatsappNumber: '5511999999999',
  address:        'Rua da Beleza, 123 — São Paulo, SP',
  mapsUrl:        'https://maps.google.com/?q=Rua+da+Beleza+123+São+Paulo',
  // Embed OpenStreetMap (sem chave de API). Substitua pelo iframe do Google Maps se preferir.
  mapsEmbedUrl:   'https://www.openstreetmap.org/export/embed.html?bbox=-46.6617%2C-23.5714%2C-46.6017%2C-23.5214&layer=mapnik&marker=-23.5505%2C-46.6333',
  openingHours:   'Seg–Sáb  9h – 19h',
  instagram:      '@studiobelle',
  instagramUrl:   'https://instagram.com/studiobelle',

  // ─── ACESSO ADMIN ───────────────────────────────────────────────
  // Acesso oculto: pressione e segure o ícone de Perfil por 1,5s
  adminPin: '1234', // Troque antes de entregar ao cliente

  // ─── BANNERS ────────────────────────────────────────────────────
  banners: [
    {
      id: 1,
      url:      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop',
      title:    'Realce sua beleza natural',
      subtitle: 'Técnicas exclusivas para o seu estilo',
    },
    {
      id: 2,
      url:      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&auto=format&fit=crop',
      title:    'Extensão de Cílios',
      subtitle: 'Volume e naturalidade em perfeito equilíbrio',
    },
    {
      id: 3,
      url:      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&auto=format&fit=crop',
      title:    'Nail Art Premium',
      subtitle: 'Arte e precisão em cada detalhe',
    },
  ],

  // ─── DESTAQUES DA SEMANA ─────────────────────────────────────────
  weekHighlights: [
    {
      id: 1,
      icon:        'Sparkles',
      tag:         'Promoção',
      title:       'Volume Russo',
      description: '20% de desconto esta semana',
    },
    {
      id: 2,
      icon:        'Star',
      tag:         'Combo',
      title:       'Unhas + Design',
      description: 'Manicure e nail art por R$ 120',
    },
    {
      id: 3,
      icon:        'Leaf',
      tag:         'Novidade',
      title:       'Brow Lamination',
      description: 'Disponível a partir desta semana',
    },
  ],

  // ─── SERVIÇOS ────────────────────────────────────────────────────
  services: [
    {
      id: 1,
      name:        'Extensão de Cílios — Fio a Fio',
      category:    'Lash',
      price:       280,
      duration:    150,
      description: 'Técnica delicada que preserva o volume natural dos cílios com resultado duradouro.',
      imageUrl:    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop',
    },
    {
      id: 2,
      name:        'Volume Russo',
      category:    'Lash',
      price:       350,
      duration:    180,
      description: 'Leques de 2D a 6D para um resultado intenso com aparência elegante.',
      imageUrl:    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&auto=format&fit=crop',
    },
    {
      id: 3,
      name:        'Manutenção de Cílios',
      category:    'Lash',
      price:       180,
      duration:    90,
      description: 'Reposição dos fios e ajustes para manter a perfeição do resultado original.',
      imageUrl:    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop',
    },
    {
      id: 4,
      name:        'Design de Sobrancelha',
      category:    'Sobrancelhas',
      price:       65,
      duration:    45,
      description: 'Mapeamento facial e design personalizado para valorizar sua expressão.',
      imageUrl:    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&auto=format&fit=crop',
    },
    {
      id: 5,
      name:        'Henna de Sobrancelha',
      category:    'Sobrancelhas',
      price:       90,
      duration:    60,
      description: 'Coloração natural com efeito preenchedor. Duração de até 30 dias.',
      imageUrl:    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop',
    },
    {
      id: 6,
      name:        'Brow Lamination',
      category:    'Sobrancelhas',
      price:       140,
      duration:    75,
      description: 'Alinha e fixa os fios, criando o efeito penteado que permanece por semanas.',
      imageUrl:    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop',
    },
    {
      id: 7,
      name:        'Manicure',
      category:    'Nails',
      price:       55,
      duration:    60,
      description: 'Cuidado completo para as mãos com acabamento perfeito.',
      imageUrl:    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop',
    },
    {
      id: 8,
      name:        'Gel nas Unhas',
      category:    'Nails',
      price:       160,
      duration:    120,
      description: 'Unhas perfeitas com durabilidade superior. Resultado até 3 semanas.',
      imageUrl:    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&auto=format&fit=crop',
    },
  ],

  // ─── HORÁRIOS ────────────────────────────────────────────────────
  availableHours: [
    '09:00', '10:00', '11:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00',
  ],

  // ─── PRODUTOS ─────────────────────────────────────────────────────
  products: [
    {
      id: 1,
      name:        'Sérum para Cílios',
      description: 'Fortalece e estimula o crescimento natural. Uso diário noturno.',
      price:       89.90,
      category:    'Cílios',
      imageUrl:    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop',
      inStock:     true,
    },
    {
      id: 2,
      name:        'Óleo para Cutículas',
      description: 'Hidratação intensa e aroma suave. Para unhas e cutículas saudáveis.',
      price:       38.00,
      category:    'Nails',
      imageUrl:    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop',
      inStock:     true,
    },
    {
      id: 3,
      name:        'Kit Pós-Lash',
      description: 'Shampoo + escova para manutenção das extensões em casa.',
      price:       68.00,
      category:    'Cílios',
      imageUrl:    'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop',
      inStock:     true,
    },
    {
      id: 4,
      name:        'Henna Profissional',
      description: 'Kit para retoques entre as sessões. Resultado salão em casa.',
      price:       125.00,
      category:    'Sobrancelhas',
      imageUrl:    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&auto=format&fit=crop',
      inStock:     false,
    },
  ],

}
