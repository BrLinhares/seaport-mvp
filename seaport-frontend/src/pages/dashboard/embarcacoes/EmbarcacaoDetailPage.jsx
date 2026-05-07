import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Ship, Building2, HardHat, User, Ruler, Layers,
  Settings, Zap, Users, Navigation, ArrowLeft, Pencil, Loader2, Fuel
} from 'lucide-react'
import { buscarPorId } from '../../../api/embarcacoesApi'

function val(v) {
  if (v === null || v === undefined || v === '') return '—'
  return String(v)
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="detail-section">
      <div className="detail-section-title">
        <Icon size={15} />
        {title}
      </div>
      {children}
    </div>
  )
}

function Grid({ children }) {
  return <div className="detail-grid">{children}</div>
}

function Field({ label, value }) {
  return (
    <div className="detail-field">
      <label>{label}</label>
      <span>{val(value)}</span>
    </div>
  )
}

export default function EmbarcacaoDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [emb, setEmb] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await buscarPorId(id)
        setEmb(data)
      } catch {
        setError('Erro ao carregar embarcação.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>
  }

  if (!emb) return null

  const propulsoes = Array.isArray(emb.propulsoes) ? emb.propulsoes : []
  const tanques = Array.isArray(emb.tanques) ? emb.tanques : []

  const TIPO_LABEL = { COMBUSTIVEL: 'Combustível', AGUA: 'Água' }
  const LOC_LABEL = { BORESTE: 'Boreste', BOMBORDO: 'Bombordo', CENTRO: 'Centro', SERVICO: 'Serviço', OUTRO: 'Outro' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '8px 12px' }}
            onClick={() => navigate('/dashboard/embarcacoes')}
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ship size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{emb.nome}</h2>
          </div>
        </div>
        <button
          className="btn btn-accent"
          onClick={() => navigate(`/dashboard/embarcacoes/${id}/editar`)}
        >
          <Pencil size={15} />
          Editar
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <Section icon={Ship} title="Identificação">
            <Grid>
              <Field label="Nome" value={emb.nome} />
              <Field label="Tipo de Embarcação" value={emb.tipoEmbarcacao} />
              <Field label="Área de Navegação" value={emb.areaNavegacao} />
              <Field label="Porto de Registro" value={emb.portoRegistro} />
              <Field label="Ano de Construção" value={emb.anoConstrucao} />
              <Field label="Porte Bruto (TPB)" value={emb.porteBruto} />
              <Field label="Arqueação Bruta" value={emb.arqueacaoBruta} />
              <Field label="Arqueação Líquida" value={emb.arqueacaoLiquida} />
            </Grid>
          </Section>

          <Section icon={Building2} title="Armador">
            <Grid>
              <Field label="Nome" value={emb.armador?.nome} />
              <Field label="Nacionalidade" value={emb.armador?.nacionalidade} />
              <Field label="Endereço" value={emb.armador?.endereco} />
              <Field label="CEP" value={emb.armador?.cep} />
              <Field label="CNPJ" value={emb.armador?.cnpj} />
            </Grid>
          </Section>

          <Section icon={HardHat} title="Construtor">
            <Grid>
              <Field label="Nome" value={emb.construtor?.nome} />
              <Field label="Nacionalidade" value={emb.construtor?.nacionalidade} />
              <Field label="Endereço" value={emb.construtor?.endereco} />
              <Field label="CEP" value={emb.construtor?.cep} />
              <Field label="CNPJ" value={emb.construtor?.cnpj} />
            </Grid>
          </Section>

          <Section icon={User} title="Engenheiro">
            <Grid>
              <Field label="Nome" value={emb.engenheiro?.nome} />
              <Field label="Nacionalidade" value={emb.engenheiro?.nacionalidade} />
              <Field label="CREA" value={emb.engenheiro?.crea} />
            </Grid>
          </Section>

          <Section icon={Ruler} title="Casco">
            <Grid>
              <Field label="Comprimento Total (m)" value={emb.caracteristicasCasco?.comprimentoTotal} />
              <Field label="Compr. Entre Perpendiculares (m)" value={emb.caracteristicasCasco?.comprimentoEntrePerpendiculares} />
              <Field label="Boca (m)" value={emb.caracteristicasCasco?.boca} />
              <Field label="Pontal (m)" value={emb.caracteristicasCasco?.pontal} />
              <Field label="Calado (m)" value={emb.caracteristicasCasco?.calado} />
              <Field label="Deslocamento Leve (t)" value={emb.caracteristicasCasco?.deslocamentoLeve} />
              <Field label="Deslocamento Carregado (t)" value={emb.caracteristicasCasco?.deslocamentoCarregado} />
            </Grid>
          </Section>

          <Section icon={Layers} title="Estrutura">
            <Grid>
              <Field label="Material do Casco" value={emb.estrutura?.materialCasco} />
              <Field label="Material do Convés" value={emb.estrutura?.materialConves} />
              <Field label="Material das Anteparas" value={emb.estrutura?.materialAnteparas} />
              <Field label="Material da Superestrutura" value={emb.estrutura?.materialSuperestrutura} />
              <Field label="Tipo de Estrutura" value={emb.estrutura?.tipoEstrutura} />
            </Grid>
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-light)', marginBottom: 12 }}>
                Compartimentagem
              </p>
              <Grid>
                <Field label="Local da Superestrutura" value={emb.compartimentagem?.localSuperestrutura} />
                <Field label="Local da Praça de Máquinas" value={emb.compartimentagem?.localPracaMaquinas} />
                <Field label="Nº Anteparas Transversais" value={emb.compartimentagem?.numeroAnteparasTransversais} />
                <Field label="Nº de Conveses" value={emb.compartimentagem?.numeroConveses} />
                <Field label="Nº de Casarias" value={emb.compartimentagem?.numeroCasarias} />
              </Grid>
            </div>
          </Section>

          <Section icon={Zap} title="Propulsão">
            {propulsoes.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-light)' }}>Nenhuma propulsão registrada.</p>
            ) : (
              <div className="table-container" style={{ marginBottom: 16 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tipo</th>
                      <th>Qtd</th>
                      <th>Marca</th>
                      <th>Potência (CV)</th>
                      <th>RPM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propulsoes.map((p, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{val(p.tipo)}</td>
                        <td>{val(p.quantidade)}</td>
                        <td>{val(p.marca)}</td>
                        <td>{val(p.potencia)}</td>
                        <td>{val(p.rpm)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-light)', marginBottom: 12 }}>
              Energia
            </p>
            <Grid>
              <Field label="Tipo de Motor" value={emb.energia?.tipoMotor} />
              <Field label="Potência do Gerador (kW)" value={emb.energia?.potenciaGerador} />
              <Field label="Quantidade de Geradores" value={emb.energia?.quantidadeGeradores} />
            </Grid>
          </Section>

          <Section icon={Users} title="Tripulação">
            <Grid>
              <Field label="Quantidade de Tripulantes" value={emb.tripulacao?.quantidadeTripulantes} />
              <Field label="Quantidade de Passageiros" value={emb.tripulacao?.quantidadePassageiros} />
            </Grid>
          </Section>

          <Section icon={Settings} title="Equipamentos">
            <Grid>
              <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
                <label>Navegação</label>
                <span style={{ whiteSpace: 'pre-wrap' }}>{val(emb.equipamentos?.navegacao)}</span>
              </div>
              <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
                <label>Comunicação</label>
                <span style={{ whiteSpace: 'pre-wrap' }}>{val(emb.equipamentos?.comunicacao)}</span>
              </div>
              <div className="detail-field" style={{ gridColumn: '1 / -1' }}>
                <label>Segurança</label>
                <span style={{ whiteSpace: 'pre-wrap' }}>{val(emb.equipamentos?.seguranca)}</span>
              </div>
            </Grid>
          </Section>

          <Section icon={Fuel} title={`Tanques (${tanques.length})`}>
            {tanques.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-light)' }}>Nenhum tanque cadastrado.</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nome</th>
                      <th>Tipo</th>
                      <th>Capacidade</th>
                      <th>Unidade</th>
                      <th>Localização</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tanques.map((t, idx) => (
                      <tr key={t.id ?? idx}>
                        <td>{idx + 1}</td>
                        <td>{val(t.nome)}</td>
                        <td>
                          <span className={`badge ${t.tipo === 'COMBUSTIVEL' ? 'badge-tanque-comb' : 'badge-tanque-agua'}`}>
                            {TIPO_LABEL[t.tipo] ?? val(t.tipo)}
                          </span>
                        </td>
                        <td>{val(t.capacidade)}</td>
                        <td>{val(t.unidade)}</td>
                        <td>{LOC_LABEL[t.localizacao] ?? val(t.localizacao)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section icon={Navigation} title="Observações">
            <div className="detail-field">
              <span style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{val(emb.observacoes)}</span>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
