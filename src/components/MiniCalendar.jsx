import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS   = ['D','S','T','Q','Q','S','S']

/** Gera a matriz de dias do mês (6 linhas x 7 colunas, null para dias fora do mês) */
function buildMatrix(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const rows = []
  let day = 1 - firstWeekday
  for (let r = 0; r < 6; r++) {
    const row = []
    for (let c = 0; c < 7; c++, day++) {
      row.push(day >= 1 && day <= daysInMonth ? day : null)
    }
    rows.push(row)
    if (day > daysInMonth) break
  }
  return rows
}

function pad2(n) { return String(n).padStart(2, '0') }

/**
 * MiniCalendar — componente de calendário mensal reutilizável.
 *
 * Props:
 *   selectedDate    string 'YYYY-MM-DD' | null
 *   onDateClick     (dateStr: string) => void
 *   markedDates     { [dateStr]: { color?: string, count?: number } }
 *   blockedDates    string[]  — datas explicitamente bloqueadas
 *   blockedWeekdays number[]  — dias da semana bloqueados (0=Dom, 6=Sáb)
 *   disablePast     boolean   — bloqueia datas anteriores a hoje
 *   initialYear     number
 *   initialMonth    number (0-11)
 */
export default function MiniCalendar({
  selectedDate    = null,
  onDateClick     = () => {},
  markedDates     = {},
  blockedDates    = [],
  blockedWeekdays = [],
  disablePast     = false,
  initialYear,
  initialMonth,
}) {
  const now = new Date()
  const [year,  setYear]  = useState(initialYear  ?? now.getFullYear())
  const [month, setMonth] = useState(initialMonth ?? now.getMonth())

  const matrix  = buildMatrix(year, month)
  const todayStr = `${now.getFullYear()}-${pad2(now.getMonth()+1)}-${pad2(now.getDate())}`

  const prev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const next = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  return (
    <div>
      {/* Header: mês e navegação */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors active:scale-90" style={{ background: 'rgba(120,120,128,0.1)' }}>
          <ChevronLeft size={16} strokeWidth={2} className="text-label" />
        </button>
        <span className="font-heading text-[15px] font-semibold text-label">
          {MONTHS[month]} {year}
        </span>
        <button onClick={next} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors active:scale-90" style={{ background: 'rgba(120,120,128,0.1)' }}>
          <ChevronRight size={16} strokeWidth={2} className="text-label" />
        </button>
      </div>

      {/* Cabeçalho dos dias — todos cinza, sem vermelho no domingo */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-bold py-1 uppercase tracking-wider"
            style={{ color: 'rgba(60,60,67,0.4)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      {matrix.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7 gap-1">
          {row.map((day, ci) => {
            if (!day) return <div key={ci} />
            const dateStr    = `${year}-${pad2(month+1)}-${pad2(day)}`
            const isToday    = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const isBlocked  = blockedDates.includes(dateStr)
            const isWdBlock  = blockedWeekdays.includes(ci)
            const isPast     = disablePast && dateStr < todayStr
            const disabled   = isBlocked || isWdBlock || isPast
            const mark       = markedDates[dateStr]

            return (
              <motion.button
                key={ci}
                whileTap={{ scale: disabled ? 1 : 0.85 }}
                onClick={() => !disabled && onDateClick(dateStr)}
                disabled={disabled}
                className="h-9 flex flex-col items-center justify-center rounded-xl relative transition-colors duration-150 select-none"
                style={{
                  opacity: disabled ? 0.35 : 1,
                  cursor:  disabled ? 'not-allowed' : 'pointer',
                  pointerEvents: disabled ? 'none' : 'auto',
                  background: isSelected
                    ? 'var(--color-accent)'
                    : isToday
                    ? 'color-mix(in srgb, var(--color-accent) 14%, transparent)'
                    : 'transparent',
                  border: isToday && !isSelected
                    ? '1.5px solid var(--color-accent)'
                    : '1.5px solid transparent',
                }}
              >
                <span
                  className="text-[13px] font-semibold leading-tight"
                  style={{
                    color: isSelected ? '#fff' : disabled ? 'rgba(60,60,67,0.4)' : '#1D1D1F',
                  }}
                >
                  {day}
                </span>

                {/* Dot de marcação */}
                {mark && !isSelected && (
                  <span
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{ background: mark.color ?? 'var(--color-accent)' }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
