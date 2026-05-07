import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ship, ClipboardList, CheckSquare, XCircle, Clock, ArrowRight } from 'lucide-react'
import { registrosApi } from '../../api/registrosApi'
import { useAuthStore } from '../../store/authStore'

export default function DashboardGerente() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ pendentes: 0, aprovados: 0, rejeitados: 0 })
  const [recentes, setRecentes] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const { content } = await registrosApi.listarTodos({ size: 5 })
        setRecentes(content ?? [])

        const [pend, aprov, rej] = await Promise.all([
          registrosApi.listarTodos({ status: 'PENDENTE', size: 1 }),
          registrosApi.listarTodos({ status: 'APROVADO', size: 1 }),
          registrosApi.listarTodos({ status: 'REJEITADO', size: 1 }),
        ])
        setStats({
          pendentes: pend.totalElements ?? 0,
          aprovados: aprov.totalElements ?? 0,
          rejeitados: rej.totalElements ?? 0,
        })
      } catch { /* silencioso */ }
    }
    load()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  }

  const statusBadge = (s) => {
    const map = {
      PENDENTE: { color: '#f59e0b', bg: '#fffbeb', label: 'Pendente' },
      APROVADO: { color: '#16a34a', bg: '#f0fdf4', label: 'Aprovado' },
      REJEITADO: { color: '#dc2626', bg: '#fef2f2', label: 'Rejeitado' },
    }
    const c = map[s] ?? map.PENDENTE
    return (
      <span style={{
        background: c.bg, color: c.color,
        padding: '2px 10px', borderRadius: 99,
        fontSize: 12, fontWeight: 700,
      }}>{c.label}</span>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>
          {greeting()}, {user?.name?.split(' ')[0]}!
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-light)', marginTop: 4 }}>
          Painel do Gerente — {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/registros?status=PENDENTE')}>
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.pendentes}</div>
            <div className="stat-label">Aguardando Aprovação</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckSquare size={22} /></div>
          <div>
            <div className="stat-value">{stats.aprovados}</div>
            <div className="stat-label">Aprovados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
            <XCircle size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.rejeitados}</div>
            <div className="stat-label">Rejeitados</div>
          </div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/embarcacoes')}>
          <div className="stat-icon blue"><Ship size={22} /></div>
          <div>
            <div className="stat-value">—</div>
            <div className="stat-label">Embarcações</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Registros Recentes</span>
          <button className="btn btn-ghost" style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }}
            onClick={() => navigate('/dashboard/registros')}>
            Ver todos <ArrowRight size={14} />
          </button>
        </div>
        <div className="table-container">
          {recentes.length === 0 ? (
            <div className="placeholder-page" style={{ height: 120 }}>
              <ClipboardList size={32} strokeWidth={1.5} />
              <p style={{ fontSize: 13 }}>Nenhum registro ainda</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Embarcação</th>
                  <th>Tipo</th>
                  <th>Criado por</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map(r => (
                  <tr key={r.id}>
                    <td>{r.embarcacaoNome}</td>
                    <td>{r.tipo}</td>
                    <td>{r.criadorNome}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-light)' }}>
                      {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                    </td>
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
