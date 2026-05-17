import { useState, useMemo, useEffect } from 'react'
import { TrendingUp, Users, Calendar, CreditCard, Check, X, Clock, Package, Plus, Minus, CalendarDays, ArrowUpRight, ArrowDownRight, Pencil, Save, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import MiniCalendar from '../../components/MiniCalendar'

const FILTERS = [
  { id: 'today', label: 'Hoje' },
  { id: 'week',  label: 'Semana' },
  { id: 'month', label: 'Mês' },
  { id: 'all',   label: 'Tudo' },
]

const PAY_CFG = {
  paid:     { label: 'Pago',      color: '#34C759', bg: 'rgba(52,199,89,0.1)' },
  pending:  { label: 'Pendente',  color: '#FF9500', bg: 'rgba(255,149,0,0.1)' },
  refunded: { label: 'Estornado', color: '#FF3B30', bg: 'rgba(255,59,48,0.1)' },
}

const SUB_TABS = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'stock',    label: 'Estoque'     },
]

const fmtMoney = v => `R$ ${Number(v).toFixed(2).replace('.', ',')}`
const todayISO = () => new Date().toISOString().split('T')[0]
const addDaysISO = (iso, n) => {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
const diffDaysInclusive = (a, b) =>
  Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000) + 1

function MetricCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2 bg-white"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: accent ? 'color-mix(in srgb, var(--color-accent) 14%, transparent)' : 'rgba(120,120,128,0.08)' }}
        >
          <Icon size={15} strokeWidth={1.5} style={{ color: accent ? 'var(--color-accent)' : 'var(--color-secondary)' }} />
        </div>
        <p className="text-[11px] text-label-2 uppercase tracking-wider font-bold">{label}</p>
      </div>
      <p className="font-heading text-[22px] font-bold text-label tracking-tight leading-none">{value}</p>
      {sub && <p className="text-[11px] text-label-2">{sub}</p>}
    </div>
  )
}

// ── Construção dos dados do gráfico por período (lógica centralizada) ──
function buildChartData(period, customRange, appointments) {
  const today = todayISO()

  // Helper: soma faturamento PAGO em uma data específica
  const sumPaidOnDate = (dateStr) =>
    appointments
      .filter(a => a.date === dateStr && a.paymentStatus === 'paid')
      .reduce((s, a) => s + (Number(a.service?.price) || 0), 0)

  // Custom range tem prioridade
  if (customRange.from && customRange.to) {
    const [from, to] = customRange.from <= customRange.to
      ? [customRange.from, customRange.to]
      : [customRange.to, customRange.from]
    const days = diffDaysInclusive(from, to)
    const data = []
    for (let i = 0; i < days; i++) {
      const dateStr = addDaysISO(from, i)
      const date = new Date(dateStr + 'T12:00:00')
      const showLabel = days <= 14 ? true : (i % Math.ceil(days / 6) === 0)
      data.push({
        key: dateStr,
        revenue: sumPaidOnDate(dateStr),
        label: showLabel ? String(date.getDate()) : '',
        tooltipLabel: date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
      })
    }
    return { data, periodLabel: 'Período personalizado' }
  }

  // ── HOJE: 9h–21h, labels apenas em 8h/12h/16h/20h ──
  if (period === 'today') {
    const data = []
    const VISIBLE_HOURS = [8, 12, 16, 20]
    for (let h = 8; h <= 21; h++) {
      const hourStr = String(h).padStart(2, '0')
      const revenue = appointments
        .filter(a => a.date === today && a.paymentStatus === 'paid' && a.time?.startsWith(hourStr + ':'))
        .reduce((s, a) => s + (Number(a.service?.price) || 0), 0)
      data.push({
        key: `${today}-${hourStr}`,
        revenue,
        label: VISIBLE_HOURS.includes(h) ? `${hourStr}h` : '',
        tooltipLabel: `${hourStr}:00 — Hoje`,
      })
    }
    return { data, periodLabel: 'Hoje' }
  }

  // ── SEMANA: Segunda → Domingo (sempre os 7) ──
  if (period === 'week') {
    const now = new Date()
    const dow = now.getDay() // 0=Dom
    const monday = new Date(now)
    monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1))

    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    const data = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      data.push({
        key: dateStr,
        revenue: sumPaidOnDate(dateStr),
        label: labels[i],
        tooltipLabel: d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }),
      })
    }
    return { data, periodLabel: 'Semana atual' }
  }

  // ── MÊS: dia 1 até último dia, labels em 1/5/10/15/20/25/30 ──
  if (period === 'month') {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const VISIBLE_DAYS = [1, 5, 10, 15, 20, 25, 30]

    const data = []
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const date = new Date(dateStr + 'T12:00:00')
      data.push({
        key: dateStr,
        revenue: sumPaidOnDate(dateStr),
        label: VISIBLE_DAYS.includes(day) ? String(day) : '',
        tooltipLabel: date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
      })
    }
    return { data, periodLabel: 'Mês atual' }
  }

  // ── TUDO: últimos 30 dias ──
  const data = []
  for (let i = 29; i >= 0; i--) {
    const dateStr = addDaysISO(today, -i)
    const date = new Date(dateStr + 'T12:00:00')
    const showLabel = i % 5 === 0 // a cada 5 dias
    data.push({
      key: dateStr,
      revenue: sumPaidOnDate(dateStr),
      label: showLabel ? String(date.getDate()) : '',
      tooltipLabel: date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
    })
  }
  return { data, periodLabel: 'Últimos 30 dias' }
}

// ── Path com curva monotone (suave, sem oscilar) ────────────────
function monotonePath(points) {
  if (points.length < 2) return ''
  const cmd = [`M ${points[0].x} ${points[0].y}`]
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    // Tangente horizontal nos endpoints — curva suave estilo monotone-x
    const cp1x = p0.x + (p1.x - p0.x) / 2
    const cp2x = p0.x + (p1.x - p0.x) / 2
    cmd.push(`C ${cp1x} ${p0.y}, ${cp2x} ${p1.y}, ${p1.x} ${p1.y}`)
  }
  return cmd.join(' ')
}

// ── Gráfico premium: linha suave + área + tooltip + empty state ──
function LineChart({ data, periodLabel }) {
  const [activeIdx, setActiveIdx] = useState(null)

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const hasData = totalRevenue > 0 && data.length >= 2

  const W = 320
  const H = 120
  const PAD_X = 18
  const PAD_Y = 18

  const maxVal = Math.max(...data.map(d => d.revenue), 1)
  const stepX = data.length > 1 ? (W - PAD_X * 2) / (data.length - 1) : 0

  const points = data.map((d, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_Y + (1 - d.revenue / maxVal) * (H - PAD_Y * 2),
    ...d,
  }))

  const linePath = hasData ? monotonePath(points) : ''
  const areaPath = hasData
    ? `${linePath} L ${points[points.length - 1].x} ${H - PAD_Y} L ${points[0].x} ${H - PAD_Y} Z`
    : ''

  const active = activeIdx !== null ? points[activeIdx] : null

  return (
    <div
      className="rounded-2xl p-4 bg-white relative"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading text-[14px] font-bold text-label">Faturamento</p>
        <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(60,60,67,0.4)' }}>
          {periodLabel}
        </p>
      </div>

      {/* Empty state — quando não há faturamento */}
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(120,120,128,0.08)' }}
          >
            <TrendingUp size={20} strokeWidth={1.5} style={{ color: 'rgba(60,60,67,0.35)' }} />
          </div>
          <p className="text-[12px] font-medium" style={{ color: 'rgba(60,60,67,0.5)' }}>
            Nenhum faturamento registrado para este período
          </p>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="w-full"
            style={{ height: 120, overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <path d={areaPath} fill="url(#lineGradient)" />
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hit areas + pontos visuais */}
            {points.map((p, i) => (
              <g
                key={p.key}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                onClick={() => setActiveIdx(i === activeIdx ? null : i)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
                {p.revenue > 0 && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={activeIdx === i ? 5 : 2.5}
                    fill="var(--color-accent)"
                    stroke={activeIdx === i ? '#fff' : 'transparent'}
                    strokeWidth={activeIdx === i ? 2 : 0}
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Tooltip flutuante */}
          {active && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${(active.x / W) * 100}%`,
                top: `${(active.y / H) * 100}%`,
                transform: 'translate(-50%, -135%)',
              }}
            >
              <div
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap"
                style={{
                  background: '#1D1D1F',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                }}
              >
                <p className="text-[9px] opacity-70 uppercase tracking-wider">{active.tooltipLabel}</p>
                <p className="text-[12px] mt-0.5">{fmtMoney(active.revenue)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Labels do eixo X — só mostra se há dados */}
      {hasData && (
        <div className="flex justify-between mt-3 px-1">
          {data.map((d, i) => (
            <span
              key={i}
              className="text-[9px] font-semibold flex-1 text-center"
              style={{ color: 'rgba(60,60,67,0.4)' }}
            >
              {d.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Helpers de período: começo da semana (Seg) ─────────────────
function startOfWeekISO(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const dow = d.getDay() // 0=Dom
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return d.toISOString().split('T')[0]
}

// ── Comparativo: mês x mês anterior, semana x semana anterior ──
function computeComparison(appointments) {
  const today    = todayISO()
  const todayDay = new Date(today + 'T12:00:00').getDate()
  const [y, m]   = today.split('-').map(Number)

  // Mês atual: dia 1 → hoje. Mês anterior: dia 1 → mesmo dia do mês anterior (compara janelas iguais).
  const curMonthStart = `${y}-${String(m).padStart(2,'0')}-01`
  const prevDate      = new Date(y, m - 2, 1)
  const prevY         = prevDate.getFullYear()
  const prevM         = prevDate.getMonth() + 1
  const daysInPrev    = new Date(prevY, prevM, 0).getDate()
  const cmpDay        = Math.min(todayDay, daysInPrev)
  const prevMonthStart = `${prevY}-${String(prevM).padStart(2,'0')}-01`
  const prevMonthEnd   = `${prevY}-${String(prevM).padStart(2,'0')}-${String(cmpDay).padStart(2,'0')}`

  const sumPaidInRange = (from, to) =>
    appointments
      .filter(a => a.paymentStatus === 'paid' && a.date >= from && a.date <= to)
      .reduce((s, a) => s + (Number(a.service?.price) || 0), 0)

  const monthCur  = sumPaidInRange(curMonthStart, today)
  const monthPrev = sumPaidInRange(prevMonthStart, prevMonthEnd)

  // Semana atual: Seg → hoje. Semana anterior: Seg → Dom completos.
  const curWeekMon  = startOfWeekISO(today)
  const prevWeekSun = addDaysISO(curWeekMon, -1)
  const prevWeekMon = addDaysISO(prevWeekSun, -6)
  const weekCur     = sumPaidInRange(curWeekMon, today)
  const weekPrev    = sumPaidInRange(prevWeekMon, prevWeekSun)

  const pct = (cur, prev) => {
    if (prev === 0 && cur === 0) return { pct: 0, isNew: false, isZero: true }
    if (prev === 0) return { pct: 100, isNew: true, isZero: false }
    return { pct: ((cur - prev) / prev) * 100, isNew: false, isZero: false }
  }

  return {
    month: { cur: monthCur, prev: monthPrev, ...pct(monthCur, monthPrev) },
    week:  { cur: weekCur,  prev: weekPrev,  ...pct(weekCur,  weekPrev)  },
  }
}

function ComparisonCard({ label, periodSub, cur, prev, pct, isNew, isZero }) {
  const positive = pct >= 0
  const color = isZero ? 'rgba(60,60,67,0.5)' : (positive ? '#34C759' : '#FF3B30')
  const Arrow = isZero ? null : (positive ? ArrowUpRight : ArrowDownRight)
  const pctTxt = isZero ? '—' : isNew ? 'Novo' : `${positive ? '+' : ''}${pct.toFixed(1).replace('.', ',')}%`
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1.5 bg-white"
      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.05)' }}
    >
      <p className="text-[10px] text-label-2 uppercase tracking-wider font-bold">{label}</p>
      <p className="font-heading text-[18px] font-bold text-label tracking-tight leading-none">{fmtMoney(cur)}</p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span
          className="text-[11px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"
          style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
        >
          {Arrow && <Arrow size={11} strokeWidth={2.5} />}
          {pctTxt}
        </span>
        <span className="text-[10px] text-label-3">vs {periodSub} {fmtMoney(prev)}</span>
      </div>
    </div>
  )
}

function ComparisonCards({ appointments }) {
  const cmp = useMemo(() => computeComparison(appointments), [appointments])
  return (
    <div className="grid grid-cols-2 gap-2.5 mb-4">
      <ComparisonCard label="Mês x anterior"   periodSub="mês passado"   {...cmp.month} />
      <ComparisonCard label="Semana x anterior" periodSub="semana passada" {...cmp.week} />
    </div>
  )
}

// ── Top Serviços do período ────────────────────────────────────
function TopServices({ paidTx }) {
  const ranking = useMemo(() => {
    const map = new Map()
    paidTx.forEach(a => {
      const name = a.service?.name || 'Sem serviço'
      const price = Number(a.service?.price) || 0
      const prev = map.get(name) || { name, total: 0, count: 0 }
      map.set(name, { name, total: prev.total + price, count: prev.count + 1 })
    })
    return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 5)
  }, [paidTx])

  if (ranking.length === 0) return null
  const max = ranking[0].total || 1

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={14} strokeWidth={1.75} className="text-accent" />
        <h2 className="font-heading text-[14px] font-bold text-label uppercase tracking-tight">Top Serviços</h2>
      </div>
      <div
        className="rounded-2xl p-4 bg-white flex flex-col gap-3"
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.05)' }}
      >
        {ranking.map((r, i) => {
          const pct = (r.total / max) * 100
          return (
            <div key={r.name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-label truncate flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-label-2 w-4">#{i + 1}</span>
                  {r.name}
                </p>
                <p className="text-[12px] font-bold text-accent flex-shrink-0">{fmtMoney(r.total)}</p>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(120,120,128,0.10)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: 'var(--color-accent)' }}
                />
              </div>
              <p className="text-[10px] text-label-3">{r.count} {r.count === 1 ? 'venda' : 'vendas'}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Bottom-sheet de edição/criação de transação ────────────────
function TxSheet({ mode, appt, services, onSave, onClose }) {
  const isEdit = mode === 'edit'
  const [serviceId, setServiceId] = useState(isEdit ? String(appt?.service?.id ?? '') : (services[0]?.id ?? ''))
  const [priceStr,  setPriceStr]  = useState(isEdit ? String(appt?.service?.price ?? '') : String(services[0]?.price ?? ''))
  const [clientName, setClientName] = useState(isEdit ? (appt?.clientName || '') : '')

  // Quando troca o serviço, sugere o preço dele (mas dá pra editar)
  useEffect(() => {
    const s = services.find(s => String(s.id) === String(serviceId))
    if (s) setPriceStr(String(s.price ?? 0))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId])

  const selected = services.find(s => String(s.id) === String(serviceId))
  const priceNum = Number(String(priceStr).replace(',', '.')) || 0
  const canSave = !!selected && priceNum > 0 && (isEdit || clientName.trim().length > 0)

  const handleSave = () => {
    if (!canSave) return
    const serviceSnap = { id: selected.id, name: selected.name, price: priceNum, duration: selected.duration ?? null }
    if (isEdit) {
      onSave({ service: serviceSnap })
    } else {
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      onSave({
        clientName: clientName.trim(),
        clientPhone: '',
        clientEmail: '',
        service: serviceSnap,
        date: dateStr,
        time: timeStr,
        status: 'completed',
        paymentStatus: 'paid',
      })
    }
  }

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          className="relative w-full max-w-md z-10 max-h-[92dvh] overflow-y-auto pb-safe"
          style={{ background: 'var(--color-surface)', borderRadius: '28px 28px 0 0' }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          onClick={e => e.stopPropagation()}>
          <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-5" />
          <div className="px-5 flex items-center justify-between mb-5">
            <p className="font-heading text-[18px] font-bold text-label">
              {isEdit ? 'Editar venda' : 'Lançar venda'}
            </p>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(120,120,128,0.12)' }}>
              <X size={16} strokeWidth={2} className="text-label-2" />
            </button>
          </div>

          <div className="px-5 flex flex-col gap-4 pb-6">
            {!isEdit && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Cliente</span>
                <input
                  className="ios-input"
                  placeholder="Nome da cliente (ou Walk-in)"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Serviço</span>
              <select className="ios-input" value={serviceId} onChange={e => setServiceId(e.target.value)}>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} — R$ {Number(s.price).toFixed(2).replace('.', ',')}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-label-2 uppercase tracking-wide">Valor cobrado (R$)</span>
              <input
                className="ios-input"
                type="number"
                step="0.01"
                value={priceStr}
                onChange={e => setPriceStr(e.target.value)}
              />
              <span className="text-[11px] text-label-3">
                Aplique desconto ou acréscimo direto no valor.
              </span>
            </label>

            <button
              onClick={handleSave}
              disabled={!canSave}
              className="btn-fill w-full mt-1"
              style={{ opacity: canSave ? 1 : 0.5 }}
            >
              <Save size={15} strokeWidth={2} /> {isEdit ? 'Salvar alteração' : 'Lançar venda'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Visão Geral ────────────────────────────────────────────────
function OverviewTab() {
  const { appointments, finance, services, updateAppointmentStatus, updateAppointment, addAppointment } = useApp()
  const [period, setPeriod] = useState('week')
  const [customRange, setCustomRange] = useState({ from: '', to: '' })
  const [calOpen, setCalOpen] = useState(false)
  const [sheet, setSheet] = useState(null) // { mode: 'new' } | { mode: 'edit', appt }

  const fmtDateBR = iso => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })

  const today = todayISO()
  const startOfWeekISO = () => {
    const d = new Date()
    const dow = d.getDay()
    d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
    return d.toISOString().split('T')[0]
  }
  const startOfMonthISO = today.slice(0, 7) + '-01'

  // Range para filtragem das transações + métricas (não confundir com chartData)
  const range = useMemo(() => {
    if (customRange.from && customRange.to) {
      const [from, to] = customRange.from <= customRange.to
        ? [customRange.from, customRange.to]
        : [customRange.to, customRange.from]
      return { from, to }
    }
    if (period === 'today') return { from: today,            to: today }
    if (period === 'week')  return { from: startOfWeekISO(), to: today }
    if (period === 'month') return { from: startOfMonthISO,  to: today }
    return { from: addDaysISO(today, -29), to: today }
  }, [period, customRange, today])

  // Dados do gráfico (lógica dedicada por período)
  const { data: chartData, periodLabel } = useMemo(
    () => buildChartData(period, customRange, appointments),
    [period, customRange, appointments]
  )

  // Transações filtradas
  const filteredTx = useMemo(() => {
    return appointments
      .filter(a => a.date >= range.from && a.date <= range.to)
      .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || ''))
  }, [appointments, range])

  const paidTx        = filteredTx.filter(a => a.paymentStatus === 'paid')
  const periodRevenue = paidTx.reduce((s, a) => s + (a.service?.price ?? 0), 0)
  const periodPending = filteredTx.filter(a => a.paymentStatus === 'pending').reduce((s, a) => s + (a.service?.price ?? 0), 0)

  const handleSheetSave = async (data) => {
    if (sheet?.mode === 'edit') {
      await updateAppointment(sheet.appt.id, data)
    } else {
      await addAppointment(data)
    }
    setSheet(null)
  }

  return (
    <>
      {/* Header da seção com botão de lançar venda */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase tracking-widest font-bold text-label-2">Resumo financeiro</p>
        <button
          onClick={() => setSheet({ mode: 'new' })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider"
          style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', color: 'var(--color-accent)' }}
        >
          <Plus size={13} strokeWidth={2.5} /> Lançar venda
        </button>
      </div>

      {/* Métricas globais */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <MetricCard icon={TrendingUp} label="Mês"      value={fmtMoney(finance.revenueMonth)}  sub={`${finance.totalAppts} agendamentos`} accent />
        <MetricCard icon={Calendar}   label="Hoje"     value={fmtMoney(finance.revenueToday)}  sub="receita confirmada" />
        <MetricCard icon={CreditCard} label="Ticket"   value={fmtMoney(finance.averageTicket)} sub="por atendimento" />
        <MetricCard icon={Users}      label="Clientes" value={finance.totalClients}            sub={`${finance.pendingAppts} pendentes`} />
      </div>

      {/* Comparativos: mês x mês anterior, semana x semana anterior */}
      <ComparisonCards appointments={appointments} />

      {/* Gráfico */}
      <div className="mb-4">
        <LineChart data={chartData} periodLabel={periodLabel} />
      </div>

      {/* Filtros centralizados */}
      <div className="flex justify-center gap-2 overflow-x-auto scrollbar-hide mb-3">
        {FILTERS.map(f => {
          const active = period === f.id && !(customRange.from && customRange.to)
          return (
            <button
              key={f.id}
              onClick={() => { setPeriod(f.id); setCustomRange({ from: '', to: '' }) }}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: active ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'transparent',
                color:      active ? 'var(--color-accent)' : 'rgba(60,60,67,0.55)',
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Mini Calendário — toggle sutil */}
      <div className="mb-5">
        <button
          onClick={() => setCalOpen(o => !o)}
          className="flex items-center gap-2 w-full p-2.5 rounded-xl bg-white transition-all"
          style={{
            border: `1px solid ${calOpen ? 'var(--color-accent)' : 'rgba(0,0,0,0.05)'}`,
            color: calOpen ? 'var(--color-accent)' : 'rgba(60,60,67,0.6)',
          }}
        >
          <CalendarDays size={14} strokeWidth={1.75} className="flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
          <span className="text-[12px] font-semibold flex-1 text-left">
            {customRange.from
              ? customRange.from === customRange.to
                ? new Date(customRange.from + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
                : `${fmtDateBR(customRange.from)} → ${fmtDateBR(customRange.to)}`
              : 'Filtrar por data'}
          </span>
          {customRange.from && (
            <button
              onClick={e => { e.stopPropagation(); setCustomRange({ from: '', to: '' }); setCalOpen(false) }}
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(120,120,128,0.14)' }}
            >
              <X size={10} strokeWidth={2.5} className="text-label-2" />
            </button>
          )}
        </button>

        <AnimatePresence>
          {calOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="mt-2 p-4 rounded-2xl bg-white"
                style={{ border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <MiniCalendar
                  selectedDate={customRange.from === customRange.to ? customRange.from : null}
                  onDateClick={d => {
                    setCustomRange({ from: d, to: d })
                    setPeriod('all')
                    setCalOpen(false)
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resumo do período */}
      <div className="ios-section mb-5">
        {[
          { label: 'Receita confirmada', value: fmtMoney(periodRevenue), color: '#34C759' },
          { label: 'A receber',          value: fmtMoney(periodPending), color: '#FF9500' },
          { label: 'Transações',         value: filteredTx.length,       color: 'var(--color-accent)' },
        ].map((row, i, arr) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: i < arr.length - 1 ? '0.33px solid rgba(60,60,67,0.12)' : 'none' }}>
            <p className="text-[14px] text-label-2">{row.label}</p>
            <p className="text-[14px] font-semibold" style={{ color: row.color }}>{row.value}</p>
          </div>
        ))}
      </div>

      {/* Top serviços do período */}
      <TopServices paidTx={paidTx} />

      {/* Transações */}
      <h2 className="font-heading text-[14px] font-bold text-label mb-3 uppercase tracking-tight">Transações</h2>
      {filteredTx.length === 0 ? (
        <div className="ios-card p-8 flex flex-col items-center gap-3 text-center">
          <TrendingUp size={28} strokeWidth={1} className="text-label-3" />
          <p className="text-[13px] text-label-2">Nenhuma transação neste período</p>
        </div>
      ) : (
        <div className="ios-section mb-4">
          {filteredTx.map((a, i, arr) => {
            const cfg = PAY_CFG[a.paymentStatus] ?? PAY_CFG.pending
            const StatusIcon = a.paymentStatus === 'paid' ? Check : a.paymentStatus === 'refunded' ? X : Clock
            const isPaid      = a.paymentStatus === 'paid'
            const isRefunded  = a.paymentStatus === 'refunded'
            return (
              <div key={a.id} className="px-4 py-3.5"
                style={{ borderBottom: i < arr.length - 1 ? '0.33px solid rgba(60,60,67,0.12)' : 'none' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                    <StatusIcon size={15} strokeWidth={2} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-label truncate">{a.clientName}</p>
                    <p className="text-[11px] text-label-2 truncate">{a.service?.name}</p>
                    <p className="text-[10px] text-label-2">{fmtDateBR(a.date)} · {a.time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[13px] font-semibold text-label">R$ {a.service?.price ?? '—'}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
                {/* Botões de ação */}
                <div className="flex gap-2 mt-2.5 ml-12 flex-wrap">
                  {!isRefunded && !isPaid && (
                    <button
                      onClick={() => updateAppointmentStatus(a.id, 'completed')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                      style={{ background: 'rgba(52,199,89,0.1)', color: '#34C759', border: '1px solid rgba(52,199,89,0.2)' }}
                    >
                      <Check size={11} strokeWidth={2.5} /> Confirmar pago
                    </button>
                  )}
                  {!isRefunded && (
                    <button
                      onClick={() => updateAppointmentStatus(a.id, 'cancelled')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                      style={{ background: 'rgba(255,59,48,0.08)', color: '#FF3B30', border: '1px solid rgba(255,59,48,0.15)' }}
                    >
                      <X size={11} strokeWidth={2.5} /> {isPaid ? 'Estornar' : 'Cancelar'}
                    </button>
                  )}
                  <button
                    onClick={() => setSheet({ mode: 'edit', appt: a })}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                    style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)', border: '1px solid color-mix(in srgb, var(--color-accent) 22%, transparent)' }}
                  >
                    <Pencil size={11} strokeWidth={2.5} /> Editar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sheet de edição / nova venda */}
      {sheet && (
        <TxSheet
          mode={sheet.mode}
          appt={sheet.appt}
          services={services}
          onSave={handleSheetSave}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  )
}

// ── Estoque ────────────────────────────────────────────────────
function StockTab() {
  const { products, updateProduct } = useApp()

  const stockValue = useMemo(
    () => products.reduce((s, p) => s + (p.price * (p.stockQty || 0)), 0),
    [products]
  )

  const reposicaoItems = useMemo(
    () => [...products]
      .filter(p => (p.stockQty ?? 0) < 5)
      .sort((a, b) => (a.stockQty ?? 0) - (b.stockQty ?? 0)),
    [products]
  )

  const lowStock   = products.filter(p => (p.stockQty ?? 0) <= 3 && (p.stockQty ?? 0) > 0).length
  const outOfStock = products.filter(p => (p.stockQty ?? 0) === 0).length

  const adjust = (p, delta) => {
    const next = Math.max(0, (p.stockQty || 0) + delta)
    updateProduct(p.id, { stockQty: next, inStock: next > 0 })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <MetricCard icon={Package}    label="Valor parado" value={fmtMoney(stockValue)} sub={`${products.length} produtos`} accent />
        <MetricCard icon={TrendingUp} label="Esgotados"    value={outOfStock}           sub={`${lowStock} com baixa`} />
      </div>

      {reposicaoItems.length > 0 && (
        <div className="mb-5">
          <h2 className="font-heading text-[14px] font-bold text-label mb-3 uppercase tracking-tight">
            Radar de reposição
          </h2>
          <div className="ios-section">
            {reposicaoItems.map((p, i, arr) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < arr.length - 1 ? '0.33px solid rgba(60,60,67,0.12)' : 'none' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: p.stockQty === 0 ? 'rgba(255,59,48,0.12)' : 'rgba(255,149,0,0.12)' }}>
                  <Package size={15} strokeWidth={1.5} style={{ color: p.stockQty === 0 ? '#FF3B30' : '#FF9500' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-label truncate">{p.name}</p>
                  <p className="text-[11px] text-label-2">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-bold" style={{ color: p.stockQty === 0 ? '#FF3B30' : '#FF9500' }}>
                    {p.stockQty} un.
                  </p>
                  <p className="text-[10px] text-label-2">{fmtMoney(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-heading text-[14px] font-bold text-label mb-3 uppercase tracking-tight">Ajuste de Estoque</h2>
      <div className="flex flex-col gap-2 pb-4">
        {products.map(p => (
          <div key={p.id}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white"
            style={{ border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.035)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-label truncate">{p.name}</p>
              <p className="text-[11px] text-label-2">{fmtMoney(p.price)} · {p.category}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => adjust(p, -1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(120,120,128,0.1)' }}
              >
                <Minus size={14} strokeWidth={2} className="text-label" />
              </button>
              <span className="font-bold text-[14px] text-label w-9 text-center">{p.stockQty ?? 0}</span>
              <button
                onClick={() => adjust(p, 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' }}
              >
                <Plus size={14} strokeWidth={2} className="text-accent" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default function FinanceAdmin() {
  const [tab, setTab] = useState('overview')

  return (
    <div className="px-4 pt-5">
      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'rgba(120,120,128,0.08)' }}>
        {SUB_TABS.map(t => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all"
              style={{
                background: active ? 'white' : 'transparent',
                color:      active ? 'var(--color-accent)' : 'rgba(60,60,67,0.55)',
                boxShadow:  active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'overview' && <OverviewTab />}
          {tab === 'stock'    && <StockTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
