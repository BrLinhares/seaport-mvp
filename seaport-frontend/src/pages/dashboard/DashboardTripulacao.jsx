import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Ship, Plus, Clock, CheckSquare, XCircle } from 'lucide-react'
import { registrosApi } from '../../api/registrosApi'
import { useAuthStore } from '../../store/authStore'

export default function DashboardTripulacao() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    registrosApi.listarMinhaEmbarcacao()
      .then(setRegistros)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  }

  const por = (s) => registros.filter(r => r.status === s).length

  const statusBadge = (s) => {
    const map = {
      PENDENTE: { color: '#f59e0b', bg: '#fffbeb', label: 'Pendente', icon: Clock },
      APROVADO: { color: '#16a34a', bg: '#f0fdf4', label: 'Aprovado', icon: CheckSquare },
      REJEITADO: { color: '#dc2626', bg: '#fef2f2', label: 'Rejeitado', icon: XCircle },
    }
    const c = map[s] ?? map.PENDENTE
    return (
      <span style={{ background: c.bg, color: c.color, padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
        {c.label}
      </span>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>
          {greeting()}, {user?.name?.split(' ')[0]}!
        </h2>
        {user?.embarcacaoNome && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Ship size={16} color="var(--color-primary)" />
            <span style={{ fontSize: 14, color: 'var(--color-text-light)', fontWeight: 600 }}>
              {user.embarcacaoNome}
            </span>
          </div>
        )}
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon blue"><ClipboardList size={22} /></div>
          <div>
            <div className="stat-value">{registros.length}</div>
            <div className="stat-label">Meus Registros</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{por('PENDENTE')}</div>
            <div className="stat-label">Aguardando Aprovação</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckSquare size={22} /></div>
          <div>
            <div className="stat-value">{por('APROVADO')}</div>
            <div className="stat-label">Aprovados</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-accent" style={{ width: 'auto', padding: '11px 24px' }}
          onClick={() => navigate('/dashboard/registros/novo')}>
          <Plus size={18} />
          Novo Registro
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Meus Registros Recentes</span>
        </div>
        <div className="table-container">
          {loading ? (
            <div className="placeholder-page" style={{ height: 120 }}>
              <span className="spinner spinner-dark" />
            </div>
          ) : registros.length === 0 ? (
            <div className="placeholder-page" style={{ height: 140 }}>
              <ClipboardList size={36} strokeWidth={1.5} color="var(--color-primary)" />
              <h3>Nenhum registro criado</h3>
              <p style={{ fontSize: 13 }}>Clique em "Novo Registro" para começar</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(r => (
                  <tr key={r.id}>
                    <td><span className="badge badge-blue">{r.tipo}</span></td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.descricao}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
                      {new Date(r.dataRegistro).toLocaleDateString('pt-BR')}
                    </td>
                    <td>{statusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
