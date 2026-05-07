import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, Users, Wrench, Anchor, CalendarClock } from 'lucide-react'
import { getDashboard } from '../../../api/embarcacoesApi'
import TankLevel from '../../../components/common/TankLevel'

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const TURNO_COLORS = {
  TURNO_1: { bg: '#dbeafe', color: '#1e40af' },
  TURNO_2: { bg: '#d1fae5', color: '#065f46' },
  TURNO_3: { bg: '#fef3c7', color: '#92400e' },
}

function TurnoBadge({ turno }) {
  const style = TURNO_COLORS[turno] ?? { bg: '#f3f4f6', color: '#374151' }
  return (
    <span style={{ background: style.bg, color: style.color, padding: '1px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
      {turno?.replace('_', ' ')}
    </span>
  )
}

export default function EmbarcacaoDashboardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboard(id)
      .then(setData)
      .catch(() => setError('Não foi possível carregar o painel desta embarcação.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Loader2 size={32} className="spin" color="var(--color-primary)" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error" style={{ maxWidth: 500 }}>
        <AlertCircle size={16} /> {error}
      </div>
    )
  }

  return (
    <div>
      <button
        className="btn btn-ghost"
        style={{ width: 'auto', marginBottom: 20, padding: '8px 16px', display: 'inline-flex', gap: 6 }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      {/* Header */}
      <div className="vessel-dashboard-header">
        <div className="vessel-dashboard-img">
          {data.imagem ? (
            <img src={data.imagem} alt={data.nome} />
          ) : (
            <div className="vessel-dashboard-img-placeholder">
              <Anchor size={48} color="var(--color-primary)" />
            </div>
          )}
        </div>
        <div className="vessel-dashboard-info">
          <h1 className="vessel-dashboard-name">{data.nome}</h1>
          {data.tipo && <p className="vessel-dashboard-type">{data.tipo}</p>}

          {/* Comandantes ativos por turno */}
          {data.comandantes?.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {data.comandantes.map((c) => (
                <p key={c.tripulanteId} className="vessel-dashboard-comandante">
                  <TurnoBadge turno={c.turno} />
                  <strong style={{ marginLeft: 6 }}>{c.nome}</strong>
                  <span style={{ marginLeft: 4, color: 'var(--color-text-light)', fontSize: 13 }}>— Comandante</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Botão gerenciar escala */}
        <button
          className="btn btn-ghost"
          style={{ width: 'auto', padding: '8px 14px', alignSelf: 'flex-start', display: 'inline-flex', gap: 6 }}
          onClick={() => navigate(`/dashboard/embarcacoes/${id}/escala`)}
        >
          <CalendarClock size={16} /> Gerenciar Escala
        </button>
      </div>

      {/* Tanks */}
      <div className="vessel-dashboard-tanks">
        <div className="card">
          <div className="card-body">
            <TankLevel type="combustivel" value={data.combustivel} label="Combustível" />
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <TankLevel type="agua" value={data.agua} label="Água" />
          </div>
        </div>
      </div>

      <div className="vessel-dashboard-grid">
        {/* Tripulação a bordo */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Users size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Tripulação a Bordo ({data.tripulacao?.length ?? 0})
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {data.tripulacao?.length === 0 ? (
              <p style={{ padding: '20px 24px', color: 'var(--color-text-light)', fontSize: 14 }}>
                Nenhum tripulante em escala ativa.
              </p>
            ) : (
              <ul className="vessel-crew-list">
                {data.tripulacao.map((m) => (
                  <li key={m.tripulanteId} className="vessel-crew-item">
                    <div className="vessel-crew-avatar">
                      {m.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="vessel-crew-name">{m.nome}</div>
                      <div className="vessel-crew-role">{m.funcao}</div>
                    </div>
                    <TurnoBadge turno={m.turno} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Manutenções */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Wrench size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Manutenções Aprovadas ({data.manutencoes?.length ?? 0})
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {data.manutencoes?.length === 0 ? (
              <p style={{ padding: '20px 24px', color: 'var(--color-text-light)', fontSize: 14 }}>
                Nenhuma manutenção registrada.
              </p>
            ) : (
              <ul className="vessel-registro-list">
                {data.manutencoes.map((r) => (
                  <li key={r.id} className="vessel-registro-item">
                    <p className="vessel-registro-desc">{r.descricao}</p>
                    <p className="vessel-registro-meta">
                      {formatDate(r.dataRegistro)}
                      {r.aprovadoPor && ` · Aprovado por ${r.aprovadoPor}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Manobras Realizadas */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <span className="card-title">
              <Anchor size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Manobras Realizadas — Aprovadas ({data.manobrasList?.length ?? 0})
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {!data.manobrasList?.length ? (
              <p style={{ padding: '20px 24px', color: 'var(--color-text-light)', fontSize: 14 }}>
                Nenhuma manobra aprovada registrada.
              </p>
            ) : (
              <ul className="vessel-registro-list">
                {data.manobrasList.map((m) => (
                  <li key={m.id} className="vessel-registro-item">
                    <p className="vessel-registro-desc">
                      <strong>{m.tipoManobra}</strong>
                      {' — '}{m.localManobra}
                      {m.navioOuCliente && <span style={{ color: 'var(--color-text-light)', fontSize: 13 }}> · {m.navioOuCliente}</span>}
                    </p>
                    <p className="vessel-registro-meta">
                      {formatDate(m.dataHoraInicio)}
                      {m.dataHoraFim && ` → ${formatDate(m.dataHoraFim)}`}
                      {m.consumoCombustivel != null && ` · Consumo: ${Number(m.consumoCombustivel).toLocaleString('pt-BR')} L`}
                      {m.aprovadoPor && ` · Aprovado por ${m.aprovadoPor}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
