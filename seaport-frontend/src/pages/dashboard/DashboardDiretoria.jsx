import { useEffect, useState } from 'react'
import { CheckSquare, Ship, TrendingUp, AlertTriangle } from 'lucide-react'
import { registrosApi } from '../../api/registrosApi'
import { useAuthStore } from '../../store/authStore'

export default function DashboardDiretoria() {
  const { user } = useAuthStore()
  const [aprovados, setAprovados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    registrosApi.listarAprovados()
      .then(setAprovados)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const por = (tipo) => aprovados.filter(r => r.tipo === tipo).length

  const greeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>
          {greeting()}, {user?.name?.split(' ')[0]}!
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-light)', marginTop: 4 }}>
          Painel Executivo — apenas dados aprovados
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon green"><CheckSquare size={22} /></div>
          <div>
            <div className="stat-value">{aprovados.length}</div>
            <div className="stat-label">Registros Aprovados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef9c3', color: '#ca8a04' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-value">{por('OCORRENCIA')}</div>
            <div className="stat-label">Ocorrências</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-value">{por('CONSUMO')}</div>
            <div className="stat-label">Registros de Consumo</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Ship size={22} /></div>
          <div>
            <div className="stat-value">
              {[...new Set(aprovados.map(r => r.embarcacaoId))].length}
            </div>
            <div className="stat-label">Embarcações Ativas</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Últimos Registros Aprovados</span>
        </div>
        <div className="table-container">
          {loading ? (
            <div className="placeholder-page" style={{ height: 120 }}>
              <span className="spinner spinner-dark" />
            </div>
          ) : aprovados.length === 0 ? (
            <div className="placeholder-page" style={{ height: 120 }}>
              <CheckSquare size={32} strokeWidth={1.5} />
              <p style={{ fontSize: 13 }}>Nenhum registro aprovado ainda</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Embarcação</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Aprovado em</th>
                  <th>Aprovado por</th>
                </tr>
              </thead>
              <tbody>
                {aprovados.slice(0, 15).map(r => (
                  <tr key={r.id}>
                    <td>{r.embarcacaoNome}</td>
                    <td>
                      <span className="badge badge-blue">{r.tipo}</span>
                    </td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.descricao}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
                      {r.dataAprovacao ? new Date(r.dataAprovacao).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td style={{ fontSize: 13 }}>{r.aprovadoPorNome ?? '—'}</td>
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
