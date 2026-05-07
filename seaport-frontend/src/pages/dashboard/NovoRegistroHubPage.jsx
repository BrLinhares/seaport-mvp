import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation2, Droplets, ClipboardList, ArrowRight } from 'lucide-react'

const TIPOS = [
  {
    icon: Navigation2,
    titulo: 'Manobras Realizadas',
    descricao:
      'Registre atracações, desatracações, fundeios, reboques e demais manobras operacionais realizadas pela embarcação.',
    tags: ['Atracação', 'Desatracação', 'Fundeio', 'Reboque'],
    cor: '#2563eb',
    bg: '#eff6ff',
    corBorder: '#bfdbfe',
    to: '/dashboard/manobras',
  },
  {
    icon: Droplets,
    titulo: 'Sondagem de Tanques',
    descricao:
      'Meça e registre o nível atual de combustível e água potável nos tanques a bordo para controle e aprovação.',
    tags: ['Combustível', 'Água Potável'],
    cor: '#0284c7',
    bg: '#f0f9ff',
    corBorder: '#bae6fd',
    to: '/dashboard/sondagens',
  },
  {
    icon: ClipboardList,
    titulo: 'Registro Operacional',
    descricao:
      'Checklists de operação, consumo de combustível, ocorrências a bordo e registros de manutenção preventiva.',
    tags: ['Checklist', 'Consumo', 'Ocorrência', 'Manutenção'],
    cor: '#7c3aed',
    bg: '#f5f3ff',
    corBorder: '#ddd6fe',
    to: '/dashboard/registros/novo',
  },
]

export default function NovoRegistroHubPage() {
  const navigate = useNavigate()
  const [hovIdx, setHovIdx] = useState(null)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>
          Novo Registro
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-light)', marginTop: 4 }}>
          Selecione o tipo de lançamento que deseja registrar
        </p>
      </div>

      {/* Grid de cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: 20,
      }}>
        {TIPOS.map((tipo, idx) => {
          const hov = hovIdx === idx
          const Icon = tipo.icon
          return (
            <button
              key={tipo.titulo}
              onClick={() => navigate(tipo.to)}
              onMouseEnter={() => setHovIdx(idx)}
              onMouseLeave={() => setHovIdx(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                padding: '28px 24px',
                borderRadius: 14,
                border: `1.5px solid ${hov ? tipo.cor : tipo.corBorder}`,
                background: hov ? tipo.bg : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
                boxShadow: hov
                  ? `0 6px 24px ${tipo.cor}22`
                  : '0 1px 4px rgba(0,0,0,0.06)',
                width: '100%',
              }}
            >
              {/* Ícone */}
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 14,
                background: hov ? `${tipo.cor}18` : '#f8fafc',
                border: `1.5px solid ${hov ? `${tipo.cor}40` : '#e5e7eb'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s, border-color 0.15s',
                flexShrink: 0,
              }}>
                <Icon size={30} color={tipo.cor} strokeWidth={1.7} />
              </div>

              {/* Texto */}
              <div style={{ flex: 1 }}>
                <p style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: 'var(--color-text)',
                  marginBottom: 8,
                }}>
                  {tipo.titulo}
                </p>
                <p style={{
                  fontSize: 13,
                  color: 'var(--color-text-light)',
                  lineHeight: 1.65,
                }}>
                  {tipo.descricao}
                </p>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tipo.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 9px',
                      borderRadius: 99,
                      background: hov ? `${tipo.cor}14` : '#f1f5f9',
                      color: hov ? tipo.cor : 'var(--color-text-light)',
                      border: `1px solid ${hov ? `${tipo.cor}30` : '#e2e8f0'}`,
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 6,
                paddingTop: 4,
                borderTop: `1px solid ${hov ? `${tipo.cor}20` : '#f1f5f9'}`,
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: hov ? tipo.cor : 'var(--color-text-light)',
                  transition: 'color 0.15s',
                }}>
                  Ir para registro
                </span>
                <ArrowRight
                  size={16}
                  color={hov ? tipo.cor : 'var(--color-text-light)'}
                  style={{ transition: 'color 0.15s' }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Nota informativa */}
      <div className="card" style={{
        marginTop: 28,
        background: 'var(--color-primary-light)',
        border: '1px solid #bae6f5',
      }}>
        <div className="card-body" style={{ padding: '13px 18px' }}>
          <p style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>
            ℹ️ Fluxo de aprovação
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 3 }}>
            Todos os registros ficam como <strong>Pendentes</strong> até serem aprovados pelo gerente.
            Após a aprovação, alimentam automaticamente o painel da embarcação.
          </p>
        </div>
      </div>
    </div>
  )
}
