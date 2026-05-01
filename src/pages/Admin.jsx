import { useApp } from '../context/AppContext'
import AdminLayout from './admin/AdminLayout'

/**
 * Admin.jsx — Entry point da área restrita.
 * Verifica se o usuário está autenticado (isAdmin).
 * Se não estiver, redireciona para o Perfil onde o acesso é solicitado.
 */
export default function Admin({ onNavigate }) {
  const { isAdmin } = useApp()

  if (!isAdmin) {
    // Segurança: se alguém tentar acessar /admin sem PIN, volta ao perfil
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-8 text-center gap-5">
        <p className="text-[17px] text-label-2">Acesso não autorizado.</p>
        <button onClick={() => onNavigate('profile')} className="btn-fill">
          Ir para o Perfil
        </button>
      </div>
    )
  }

  return <AdminLayout onNavigate={onNavigate} />
}
