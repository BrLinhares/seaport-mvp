import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Configurações</span>
      </div>
      <div className="card-body">
        <div className="placeholder-page">
          <Settings size={48} strokeWidth={1.5} color="var(--color-primary)" />
          <h3>Módulo em desenvolvimento</h3>
          <p style={{ fontSize: 13, maxWidth: 320 }}>
            Configurações do sistema — perfil, notificações, integrações —
            serão implementadas nas próximas fases.
          </p>
        </div>
      </div>
    </div>
  )
}
