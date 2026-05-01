// ─────────────────────────────────────────────────────────────────
//  THEME CONFIG — Configuração centralizada White-Label
//
//  Edite APENAS este arquivo para clonar o template para um novo
//  cliente. Cabeçalho, cores, fontes e redes sociais são lidos daqui.
//
//  Para configurações específicas de mock data (serviços iniciais,
//  banners, produtos), use `mockData.js`. Para chaves Firebase,
//  use `.env.local`.
// ─────────────────────────────────────────────────────────────────

export const themeConfig = {
  // ─── IDENTIDADE ─────────────────────────────────────────────────
  appName:    'Studio Belle',
  tagline:    'Beauty & Wellness',
  logoUrl:    null, // ex: '/logo.svg' — null usa o nome em texto

  // ─── PALETA ─────────────────────────────────────────────────────
  colors: {
    primary:    '#C9A96E', // accent — botões, ícones ativos
    secondary:  '#86868B', // texto de apoio
    background: '#F2F2F7', // fundo geral
    surface:    '#FFFFFF', // cards
    success:    '#34C759',
    warning:    '#FF9500',
    error:      '#FF3B30',
  },

  // ─── TIPOGRAFIA (Google Fonts) ─────────────────────────────────
  font: {
    heading: 'Montserrat',
    body:    'Montserrat',
  },

  // ─── REDES SOCIAIS / CONTATO ───────────────────────────────────
  social: {
    instagram: 'https://instagram.com/studiobelle',
    facebook:  '',
    tiktok:    '',
    youtube:   '',
    whatsapp:  '5511999999999', // só dígitos, com DDI
  },

  // ─── CONTATO / ENDEREÇO ────────────────────────────────────────
  contact: {
    phone:        '(11) 99999-9999',
    email:        'contato@studiobelle.com.br',
    address:      'Rua da Beleza, 123 — São Paulo, SP',
    mapsUrl:      'https://maps.google.com/?q=Rua+da+Beleza+123+São+Paulo',
    openingHours: 'Seg–Sáb  9h – 19h',
  },

  // ─── ACESSO ADMIN ──────────────────────────────────────────────
  adminPin: '1234',
}

// ─── Re-export legado (compat com brandConfig) ───────────────────
// Mantém componentes antigos funcionando enquanto migramos tudo
// para themeConfig. Novos componentes devem importar de themeConfig.
export const brandWhatsApp = themeConfig.social.whatsapp
export const brandColors   = themeConfig.colors
export const brandName     = themeConfig.appName

export default themeConfig
