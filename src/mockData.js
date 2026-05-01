// ─────────────────────────────────────────────────────────────────
//  Mock Data — App virgem (white-label)
//
//  Tudo vazio por padrão. A dona do studio cadastra cada item pelo
//  Painel Admin. Apenas os templates de WhatsApp vêm com texto base
//  já preenchido (que ela pode editar na aba Mensagens).
// ─────────────────────────────────────────────────────────────────

/** Serviços — vazio. A dona cadastra cada serviço com ícone, preço e duração. */
export const INITIAL_SERVICES = []

/** Banners promocionais — vazio. Se vazio, a Home mostra um placeholder. */
export const INITIAL_BANNERS = []

/** Produtos da loja — vazio. */
export const INITIAL_PRODUCTS = []

/** Feed (postagens) — vazio. */
export const INITIAL_FEED = []

/** Destaques — vazio. */
export const INITIAL_HIGHLIGHTS = []

/** Agendamentos — vazio. */
export const INITIAL_APPOINTMENTS = []

/** Bloqueios de disponibilidade — vazio. */
export const INITIAL_BLOCKS = []

/** Fila de espera — vazia. */
export const INITIAL_WAITLIST = []

/** Galeria do studio (Nosso Ambiente) — vazia. */
export const INITIAL_GALLERY = []

/** Procedimentos do carrossel da Home — vazios. */
export const INITIAL_PROCEDURES = []

/** Links externos (Conecte-se) — vazios. */
export const INITIAL_LINKS = []

/** Templates de WhatsApp — defaults úteis (a dona edita na aba Mensagens). */
export const INITIAL_WA_TEMPLATES = {
  pending:   'Olá {nome}, recebemos seu pedido de agendamento para {servico} no dia {data} às {hora}. Podemos confirmar?',
  confirmed: 'Olá {nome}! Confirmando seu agendamento de {servico} para {data} às {hora}. Te esperamos!',
  concluded: 'Olá {nome}! Esperamos que tenha gostado do seu atendimento de {servico}. Volte sempre!',
  cancelled: 'Olá {nome}, gostaríamos de confirmar o cancelamento do seu agendamento de {servico} no dia {data}.',
  waitlist:  'Olá {nome}! Abriu uma vaga para {servico} no dia {data} às {hora}. Tem interesse? Responde aqui pra confirmar.',
}
