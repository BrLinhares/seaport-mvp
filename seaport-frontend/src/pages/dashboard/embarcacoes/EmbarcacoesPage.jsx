import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ship, Plus, Eye, Pencil, Trash2, Loader2 } from 'lucide-react'
import { listar, excluir } from '../../../api/embarcacoesApi'

function DeleteModal({ embarcacao, onCancel, onConfirm, loading }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-title">Excluir Embarcação</div>
        <div className="modal-text">
          Tem certeza que deseja excluir <strong>{embarcacao?.nome}</strong>?
          Esta ação não pode ser desfeita.
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EmbarcacoesPage() {
  const navigate = useNavigate()
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function fetchLista() {
    setLoading(true)
    setError(null)
    try {
      const data = await listar()
      setLista(data)
    } catch {
      setError('Erro ao carregar embarcações. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLista()
  }, [])

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await excluir(deleteTarget.id)
      setDeleteTarget(null)
      fetchLista()
    } catch {
      setError('Erro ao excluir embarcação.')
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Ship size={22} color="var(--color-primary)" />
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Embarcações</h2>
        </div>
        <button className="btn btn-accent" onClick={() => navigate('/dashboard/embarcacoes/nova')}>
          <Plus size={16} />
          Nova Embarcação
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
            <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : lista.length === 0 ? (
          <div className="placeholder-page">
            <Ship size={40} color="var(--color-border)" />
            <h3>Nenhuma embarcação cadastrada</h3>
            <p>Clique em "Nova Embarcação" para começar.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Área de Navegação</th>
                  <th>Porto de Registro</th>
                  <th>Ano</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((emb) => (
                  <tr key={emb.id}>
                    <td style={{ fontWeight: 600 }}>{emb.nome}</td>
                    <td>{emb.tipoEmbarcacao || '—'}</td>
                    <td>{emb.areaNavegacao || '—'}</td>
                    <td>{emb.portoRegistro || '—'}</td>
                    <td>{emb.anoConstrucao || '—'}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn"
                          title="Visualizar"
                          onClick={() => navigate(`/dashboard/embarcacoes/${emb.id}`)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="action-btn"
                          title="Editar"
                          onClick={() => navigate(`/dashboard/embarcacoes/${emb.id}/editar`)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="action-btn danger"
                          title="Excluir"
                          onClick={() => setDeleteTarget(emb)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          embarcacao={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
