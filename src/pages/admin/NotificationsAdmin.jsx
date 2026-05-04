import { useState, useEffect } from 'react'
import { Bell, BellOff, AlertTriangle } from 'lucide-react'
import {
  requestPushPermission, disablePush,
  isPushSupported, getPushPermission,
} from '../../services/notificationsService'

const TOKEN_KEY = 'ownerPushToken'

export default function NotificationsAdmin() {
  const [status, setStatus] = useState('loading') // loading | idle | requesting | granted | denied | unsupported
  const [token, setToken]   = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY)
    if (saved) setToken(saved)
    if (!isPushSupported()) { setStatus('unsupported'); return }
    const p = getPushPermission()
    if (p === 'granted' && saved) setStatus('granted')
    else if (p === 'denied') setStatus('denied')
    else setStatus('idle')
  }, [])

  const enable = async () => {
    setStatus('requesting')
    const t = await requestPushPermission()
    if (t) {
      localStorage.setItem(TOKEN_KEY, t)
      setToken(t)
      setStatus('granted')
    } else {
      setStatus(getPushPermission() === 'denied' ? 'denied' : 'idle')
    }
  }

  const disable = async () => {
    if (token) await disablePush(token)
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setStatus('idle')
  }

  const isGranted = status === 'granted'

  return (
    <div className="px-4 pt-5 pb-10 max-w-lg mx-auto">
      {/* Card principal */}
      <div className="ios-section mb-5">
        <div className="ios-row justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: isGranted ? 'rgba(52,199,89,0.12)' : 'color-mix(in srgb, var(--color-accent) 12%, transparent)' }}
            >
              {isGranted
                ? <Bell size={16} strokeWidth={1.5} style={{ color: '#34C759' }} />
                : <BellOff size={16} strokeWidth={1.5} className="text-accent" />}
            </div>
            <div>
              <p className="text-[15px] font-medium text-label">Notificações Push</p>
              <p className="text-[12px] text-label-2 mt-0.5">
                {status === 'granted'     && 'Ativas neste dispositivo'}
                {status === 'denied'      && 'Bloqueadas — veja instruções abaixo'}
                {status === 'unsupported' && 'Instale o app para ativar'}
                {status === 'requesting'  && 'Aguardando permissão…'}
                {status === 'idle'        && 'Receba alertas de novos agendamentos'}
                {status === 'loading'     && '…'}
              </p>
            </div>
          </div>

          {isGranted ? (
            <button
              onClick={disable}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(255,59,48,0.10)', color: '#FF3B30' }}
            >
              Desativar
            </button>
          ) : (
            <button
              onClick={enable}
              disabled={['requesting','denied','unsupported','loading'].includes(status)}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-xl flex-shrink-0 disabled:opacity-40"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', color: 'var(--color-accent)' }}
            >
              {status === 'requesting' ? '…' : 'Ativar'}
            </button>
          )}
        </div>
      </div>

      {/* Aviso: bloqueado */}
      {status === 'denied' && (
        <div className="ios-card p-4 mb-4 flex gap-3">
          <AlertTriangle size={18} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" style={{ color: '#FF9500' }} />
          <p className="text-[13px] text-label-2 leading-relaxed">
            Notificações bloqueadas. Para reativar no iPhone: <strong>Ajustes → Safari → Notificações</strong> e permita este site.
          </p>
        </div>
      )}

      {/* Aviso: não instalado (iOS) */}
      {status === 'unsupported' && (
        <div className="ios-card p-4 mb-4">
          <p className="text-[13px] font-semibold text-label mb-2">Para ativar no iPhone:</p>
          <div className="flex flex-col gap-2">
            {['Abra o app no Safari', 'Toque em Compartilhar (ícone ↑)', 'Toque em "Adicionar à Tela de Início"', 'Abra o app pela tela de início e volte aqui'].map((s, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="text-[11px] font-bold text-accent w-4 flex-shrink-0 mt-0.5">{i+1}.</span>
                <p className="text-[13px] text-label-2">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* O que você recebe */}
      <div className="ios-section mb-4">
        <div className="px-4 py-4">
          <p className="text-[12px] font-bold uppercase tracking-widest text-label-2 mb-3">Você vai receber quando:</p>
          {[
            ['📅', 'Uma cliente fizer um agendamento'],
            ['⏳', 'Alguém entrar na fila de espera'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3 py-1.5">
              <span className="text-[16px]">{icon}</span>
              <p className="text-[13px] text-label-2">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-label-3 text-center leading-relaxed px-2">
        Para receber em mais de um aparelho, ative as notificações em cada um separadamente.
      </p>
    </div>
  )
}
