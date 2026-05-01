import { useState, useMemo } from 'react'
import { Plus, Trash2, CalendarOff, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import MiniCalendar from '../../components/MiniCalendar'
import { brandConfig } from '../../brandConfig'

export default function AvailabilityAdmin() {
  const { blocks, addBlock, removeBlock, updateBlock } = useApp()

  const [selectedDate, setSelectedDate] = useState(null)

  // Mapa de datas bloqueadas para o MiniCalendar
  const blockedDates = useMemo(() => blocks.filter(b => b.times === 'all').map(b => b.date), [blocks])

  // Bloco do dia selecionado (se existir)
  const selectedBlock = useMemo(() =>
    selectedDate ? blocks.find(b => b.date === selectedDate) : null,
    [blocks, selectedDate]
  )

  const isFullyBlocked = selectedBlock?.times === 'all'

  const toggleFullDay = () => {
    if (!selectedDate) return
    if (selectedBlock) {
      if (isFullyBlocked) removeBlock(selectedBlock.id)
      else updateBlock(selectedBlock.id, { times: 'all' })
    } else {
      addBlock({ date: selectedDate, times: 'all' })
    }
  }

  const toggleHour = (h) => {
    if (!selectedDate) return
    if (!selectedBlock) {
      addBlock({ date: selectedDate, times: [h] })
      return
    }
    if (selectedBlock.times === 'all') return // dia todo bloqueado
    const current = selectedBlock.times
    const next = current.includes(h) ? current.filter(t => t !== h) : [...current, h]
    if (next.length === 0) removeBlock(selectedBlock.id)
    else updateBlock(selectedBlock.id, { times: next })
  }

  const isHourBlocked = (h) => {
    if (!selectedBlock) return false
    if (selectedBlock.times === 'all') return true
    return selectedBlock.times.includes(h)
  }

  const fmt = iso => iso
    ? new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  return (
    <div className="px-4 pt-5">
      <p className="text-[13px] text-label-2 mb-4">
        Selecione um dia no calendário para bloquear horários ou o dia inteiro.
      </p>

      {/* Calendário */}
      <MiniCalendar
        selectedDate={selectedDate}
        onDateClick={setSelectedDate}
        blockedDates={blockedDates}
      />

      {/* Controles do dia selecionado */}
      {selectedDate && (
        <div className="mt-5">
          <p className="font-heading text-[16px] font-bold text-label capitalize mb-4">{fmt(selectedDate)}</p>

          {/* Toggle dia inteiro */}
          <div className="ios-section mb-4">
            <div className="ios-row justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'color-mix(in srgb, #FF3B30 12%, transparent)' }}>
                  <CalendarOff size={16} strokeWidth={1.5} style={{ color: '#FF3B30' }} />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-label">Bloquear dia inteiro</p>
                  <p className="text-[12px] text-label-2">Nenhum horário disponível</p>
                </div>
              </div>
              <button
                onClick={toggleFullDay}
                className="relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0"
                style={{ background: isFullyBlocked ? '#FF3B30' : 'rgba(120,120,128,0.2)' }}
              >
                <motion.div
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm"
                  animate={{ left: isFullyBlocked ? '1.5rem' : '0.125rem' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              </button>
            </div>
          </div>

          {/* Horários individuais */}
          {!isFullyBlocked && (
            <div>
              <p className="text-[13px] text-label-2 mb-3">
                <Clock size={12} strokeWidth={1.5} className="inline mr-1" />
                Toque em um horário para bloqueá-lo
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {brandConfig.availableHours.map(h => {
                  const blocked = isHourBlocked(h)
                  return (
                    <motion.button
                      key={h}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => toggleHour(h)}
                      className="py-3 rounded-2xl text-[14px] font-medium transition-all duration-200 select-none"
                      style={{
                        background: blocked ? 'rgba(255,59,48,0.12)' : 'var(--color-surface)',
                        color:      blocked ? '#FF3B30' : '#1D1D1F',
                        boxShadow:  blocked ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
                        textDecoration: blocked ? 'line-through' : 'none',
                      }}
                    >
                      {h}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de todos os bloqueios */}
      {blocks.length > 0 && (
        <div className="mt-7">
          <h2 className="font-heading text-[16px] font-bold text-label mb-3">Bloqueios Ativos</h2>
          <div className="ios-section">
            {blocks
              .sort((a,b) => a.date.localeCompare(b.date))
              .map((b, i, arr) => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < arr.length-1 ? '0.33px solid rgba(60,60,67,0.12)' : 'none' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,59,48,0.1)' }}>
                    <CalendarOff size={14} strokeWidth={1.5} style={{ color: '#FF3B30' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-label capitalize">
                      {new Date(b.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-[12px] text-label-2">
                      {b.times === 'all' ? 'Dia inteiro bloqueado' : `${b.times.length} horário${b.times.length!==1?'s':''}: ${b.times.join(', ')}`}
                    </p>
                  </div>
                  <motion.button whileTap={{ scale: 0.88 }}
                    onClick={() => removeBlock(b.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,59,48,0.08)' }}>
                    <Trash2 size={14} strokeWidth={1.5} style={{ color: '#FF3B30' }} />
                  </motion.button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
