import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ship, BarChart3, Loader2, AlertCircle } from 'lucide-react'
import { listar } from '../../../api/embarcacoesApi'

export default function DiretoriaEmbarcacoesPage() {
  const navigate = useNavigate()
  const [embarcacoes, setEmbarcacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    listar()
      .then(setEmbarcacoes)
      .catch(() => setError('Não foi possível carregar as embarcações.'))
      .finally(() => setLoading(false))
  }, [])

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
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>Frota</h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-light)', marginTop: 4 }}>
          {embarcacoes.length} embarcação{embarcacoes.length !== 1 ? 'ões' : ''} cadastrada{embarcacoes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {embarcacoes.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
            <Ship size={48} color="var(--color-text-light)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-text-light)', fontSize: 15 }}>
              Nenhuma embarcação cadastrada.
            </p>
          </div>
        </div>
      ) : (
        <div className="vessel-card-grid">
          {embarcacoes.map((emb) => (
            <button
              key={emb.id}
              className="vessel-card"
              onClick={() => navigate(`/dashboard/embarcacoes/${emb.id}/painel`)}
            >
              <div className="vessel-card-img">
                {emb.imagem ? (
                  <img src={emb.imagem} alt={emb.nome} />
                ) : (
                  <div className="vessel-card-img-placeholder">
                    <Ship size={40} color="var(--color-primary)" />
                  </div>
                )}
              </div>
              <div className="vessel-card-body">
                <div className="vessel-card-name">{emb.nome}</div>
                {emb.tipoEmbarcacao && (
                  <div className="vessel-card-type">{emb.tipoEmbarcacao}</div>
                )}
                <div className="vessel-card-action">
                  <BarChart3 size={14} />
                  Ver painel
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
