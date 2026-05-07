package com.seaport.service;

import com.seaport.dto.embarcacao.*;
import com.seaport.dto.tanque.TanqueDTO;
import com.seaport.dto.tanque.TanqueResponseDTO;
import com.seaport.entity.*;
import com.seaport.entity.embeddable.*;
import com.seaport.repository.EmbarcacaoRepository;
import com.seaport.repository.EmbarcacaoRepository.EmbarcacaoSummaryProjection;
import com.seaport.repository.ManobraRepository;
import com.seaport.repository.RegistroOperacionalRepository;
import com.seaport.repository.SondagemTanqueRepository;
import com.seaport.repository.UserRepository;
import com.seaport.service.EscalaTripulacaoService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmbarcacaoService {

    private final EmbarcacaoRepository embarcacaoRepository;
    private final RegistroOperacionalRepository registroRepository;
    private final SondagemTanqueRepository sondagemRepository;
    private final ManobraRepository manobraRepository;
    private final UserRepository userRepository;
    private final TanqueService tanqueService;
    private final EscalaTripulacaoService escalaTripulacaoService;

    // -------------------------------------------------------------------------
    // Leitura
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<EmbarcacaoSummaryDTO> listarTodos() {
        return embarcacaoRepository.findAllProjectedBy()
                .stream()
                .map(this::projectionToSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmbarcacaoResponseDTO buscarPorId(Long id) {
        Embarcacao embarcacao = embarcacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Embarcação não encontrada com id: " + id));
        return toResponseDTO(embarcacao);
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    @Transactional
    public EmbarcacaoResponseDTO criar(EmbarcacaoRequestDTO dto) {
        Embarcacao embarcacao = toEntity(dto);
        embarcacao = embarcacaoRepository.save(embarcacao);
        return toResponseDTO(embarcacao);
    }

    @Transactional
    public EmbarcacaoResponseDTO atualizar(Long id, EmbarcacaoRequestDTO dto) {
        Embarcacao embarcacao = embarcacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Embarcação não encontrada com id: " + id));

        // Campos diretos
        embarcacao.setNome(dto.getNome());
        embarcacao.setImagem(dto.getImagem());
        embarcacao.setAnoConstrucao(dto.getAnoConstrucao());
        embarcacao.setTipoEmbarcacao(dto.getTipoEmbarcacao());
        embarcacao.setAreaNavegacao(dto.getAreaNavegacao());
        embarcacao.setPortoRegistro(dto.getPortoRegistro());
        embarcacao.setPorteBruto(dto.getPorteBruto());
        embarcacao.setArqueacaoBruta(dto.getArqueacaoBruta());
        embarcacao.setArqueacaoLiquida(dto.getArqueacaoLiquida());
        embarcacao.setObservacoes(dto.getObservacoes());

        // Embeddables
        embarcacao.setCaracteristicasCasco(mapCaracteristicasCasco(dto.getCaracteristicasCasco()));
        embarcacao.setEstrutura(mapEstrutura(dto.getEstrutura()));
        embarcacao.setCompartimentagem(mapCompartimentagem(dto.getCompartimentagem()));
        embarcacao.setEnergia(mapEnergia(dto.getEnergia()));
        embarcacao.setTripulacao(mapTripulacao(dto.getTripulacao()));
        embarcacao.setEquipamentos(mapEquipamentos(dto.getEquipamentos()));

        // Armador
        if (dto.getArmador() != null) {
            if (embarcacao.getArmador() == null) {
                embarcacao.setArmador(new Armador());
            }
            atualizarArmador(embarcacao.getArmador(), dto.getArmador());
        } else {
            embarcacao.setArmador(null);
        }

        // Construtor
        if (dto.getConstrutor() != null) {
            if (embarcacao.getConstrutor() == null) {
                embarcacao.setConstrutor(new Construtor());
            }
            atualizarConstrutor(embarcacao.getConstrutor(), dto.getConstrutor());
        } else {
            embarcacao.setConstrutor(null);
        }

        // Engenheiro
        if (dto.getEngenheiro() != null) {
            if (embarcacao.getEngenheiro() == null) {
                embarcacao.setEngenheiro(new EngenheiroResponsavel());
            }
            atualizarEngenheiro(embarcacao.getEngenheiro(), dto.getEngenheiro());
        } else {
            embarcacao.setEngenheiro(null);
        }

        // Propulsões — limpa e re-adiciona para respeitar orphanRemoval
        embarcacao.getPropulsoes().clear();
        if (dto.getPropulsoes() != null) {
            for (PropulsaoDTO propDto : dto.getPropulsoes()) {
                Propulsao propulsao = mapPropulsao(propDto);
                embarcacao.addPropulsao(propulsao);
            }
        }

        // Tanques — limpa e re-adiciona para respeitar orphanRemoval
        embarcacao.getTanques().clear();
        if (dto.getTanques() != null) {
            for (TanqueDTO tanqueDto : dto.getTanques()) {
                embarcacao.addTanque(tanqueService.fromDTO(tanqueDto, embarcacao));
            }
        }

        embarcacao = embarcacaoRepository.save(embarcacao);
        return toResponseDTO(embarcacao);
    }

    @Transactional
    public void excluir(Long id) {
        if (!embarcacaoRepository.existsById(id)) {
            throw new EntityNotFoundException("Embarcação não encontrada com id: " + id);
        }
        embarcacaoRepository.deleteById(id);
    }

    // -------------------------------------------------------------------------
    // Mapeamento DTO → Entidade
    // -------------------------------------------------------------------------

    private Embarcacao toEntity(EmbarcacaoRequestDTO dto) {
        Embarcacao embarcacao = Embarcacao.builder()
                .nome(dto.getNome())
                .imagem(dto.getImagem())
                .anoConstrucao(dto.getAnoConstrucao())
                .tipoEmbarcacao(dto.getTipoEmbarcacao())
                .areaNavegacao(dto.getAreaNavegacao())
                .portoRegistro(dto.getPortoRegistro())
                .porteBruto(dto.getPorteBruto())
                .arqueacaoBruta(dto.getArqueacaoBruta())
                .arqueacaoLiquida(dto.getArqueacaoLiquida())
                .observacoes(dto.getObservacoes())
                .caracteristicasCasco(mapCaracteristicasCasco(dto.getCaracteristicasCasco()))
                .estrutura(mapEstrutura(dto.getEstrutura()))
                .compartimentagem(mapCompartimentagem(dto.getCompartimentagem()))
                .energia(mapEnergia(dto.getEnergia()))
                .tripulacao(mapTripulacao(dto.getTripulacao()))
                .equipamentos(mapEquipamentos(dto.getEquipamentos()))
                .build();

        if (dto.getArmador() != null) {
            Armador armador = new Armador();
            atualizarArmador(armador, dto.getArmador());
            embarcacao.setArmador(armador);
        }

        if (dto.getConstrutor() != null) {
            Construtor construtor = new Construtor();
            atualizarConstrutor(construtor, dto.getConstrutor());
            embarcacao.setConstrutor(construtor);
        }

        if (dto.getEngenheiro() != null) {
            EngenheiroResponsavel engenheiro = new EngenheiroResponsavel();
            atualizarEngenheiro(engenheiro, dto.getEngenheiro());
            embarcacao.setEngenheiro(engenheiro);
        }

        if (dto.getPropulsoes() != null) {
            for (PropulsaoDTO propDto : dto.getPropulsoes()) {
                embarcacao.addPropulsao(mapPropulsao(propDto));
            }
        }

        if (dto.getTanques() != null) {
            for (TanqueDTO tanqueDto : dto.getTanques()) {
                embarcacao.addTanque(tanqueService.fromDTO(tanqueDto, embarcacao));
            }
        }

        return embarcacao;
    }

    // -------------------------------------------------------------------------
    // Mapeamento Entidade → DTO de resposta
    // -------------------------------------------------------------------------

    private EmbarcacaoResponseDTO toResponseDTO(Embarcacao e) {
        return EmbarcacaoResponseDTO.builder()
                .id(e.getId())
                .nome(e.getNome())
                .imagem(e.getImagem())
                .anoConstrucao(e.getAnoConstrucao())
                .tipoEmbarcacao(e.getTipoEmbarcacao())
                .areaNavegacao(e.getAreaNavegacao())
                .portoRegistro(e.getPortoRegistro())
                .porteBruto(e.getPorteBruto())
                .arqueacaoBruta(e.getArqueacaoBruta())
                .arqueacaoLiquida(e.getArqueacaoLiquida())
                .observacoes(e.getObservacoes())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .armador(mapArmadorDTO(e.getArmador()))
                .construtor(mapConstrutorDTO(e.getConstrutor()))
                .engenheiro(mapEngenheiroDTO(e.getEngenheiro()))
                .caracteristicasCasco(mapCaracteristicasCascoDTO(e.getCaracteristicasCasco()))
                .estrutura(mapEstruturaDTO(e.getEstrutura()))
                .compartimentagem(mapCompartimentagemDTO(e.getCompartimentagem()))
                .propulsoes(mapPropulsoesDTO(e.getPropulsoes()))
                .energia(mapEnergiaDTO(e.getEnergia()))
                .tripulacao(mapTripulacaoDTO(e.getTripulacao()))
                .equipamentos(mapEquipamentosDTO(e.getEquipamentos()))
                .tanques(e.getTanques().stream().map(tanqueService::toDTO).collect(Collectors.toList()))
                .build();
    }

    // -------------------------------------------------------------------------
    // Auxiliares de atualização de @OneToOne
    // -------------------------------------------------------------------------

    private void atualizarArmador(Armador armador, ArmadorDTO dto) {
        armador.setNome(dto.getNome());
        armador.setNacionalidade(dto.getNacionalidade());
        armador.setEndereco(dto.getEndereco());
        armador.setCep(dto.getCep());
        armador.setCnpj(dto.getCnpj());
    }

    private void atualizarConstrutor(Construtor construtor, ConstrutorDTO dto) {
        construtor.setNome(dto.getNome());
        construtor.setNacionalidade(dto.getNacionalidade());
        construtor.setEndereco(dto.getEndereco());
        construtor.setCep(dto.getCep());
        construtor.setCnpj(dto.getCnpj());
    }

    private void atualizarEngenheiro(EngenheiroResponsavel engenheiro, EngenheiroDTO dto) {
        engenheiro.setNome(dto.getNome());
        engenheiro.setNacionalidade(dto.getNacionalidade());
        engenheiro.setCrea(dto.getCrea());
    }

    // -------------------------------------------------------------------------
    // Auxiliares de mapeamento de embeddables (DTO → Entidade)
    // -------------------------------------------------------------------------

    private CaracteristicasCasco mapCaracteristicasCasco(CaracteristicasCascoDTO dto) {
        if (dto == null) return new CaracteristicasCasco();
        return new CaracteristicasCasco(
                dto.getComprimentoTotal(),
                dto.getComprimentoEntrePerpendiculares(),
                dto.getBoca(),
                dto.getPontal(),
                dto.getCalado(),
                dto.getDeslocamentoLeve(),
                dto.getDeslocamentoCarregado()
        );
    }

    private Estrutura mapEstrutura(EstruturaDTO dto) {
        if (dto == null) return new Estrutura();
        return new Estrutura(
                dto.getMaterialCasco(),
                dto.getMaterialConves(),
                dto.getMaterialAnteparas(),
                dto.getMaterialSuperestrutura(),
                dto.getTipoEstrutura()
        );
    }

    private Compartimentagem mapCompartimentagem(CompartimentagemDTO dto) {
        if (dto == null) return new Compartimentagem();
        return new Compartimentagem(
                dto.getLocalSuperestrutura(),
                dto.getLocalPracaMaquinas(),
                dto.getNumeroAnteparasTransversais(),
                dto.getNumeroConveses(),
                dto.getNumeroCasarias()
        );
    }

    private Energia mapEnergia(EnergiaDTO dto) {
        if (dto == null) return new Energia();
        return new Energia(
                dto.getTipoMotor(),
                dto.getPotenciaGerador(),
                dto.getQuantidadeGeradores()
        );
    }

    private Tripulacao mapTripulacao(TripulacaoDTO dto) {
        if (dto == null) return new Tripulacao();
        return new Tripulacao(
                dto.getQuantidadeTripulantes(),
                dto.getQuantidadePassageiros()
        );
    }

    private Equipamentos mapEquipamentos(EquipamentosDTO dto) {
        if (dto == null) return new Equipamentos();
        return new Equipamentos(
                dto.getNavegacao(),
                dto.getComunicacao(),
                dto.getSeguranca()
        );
    }

    private Propulsao mapPropulsao(PropulsaoDTO dto) {
        return Propulsao.builder()
                .tipo(dto.getTipo())
                .marca(dto.getMarca())
                .potencia(dto.getPotencia())
                .quantidade(dto.getQuantidade())
                .rpm(dto.getRpm())
                .build();
    }

    // -------------------------------------------------------------------------
    // Auxiliares de mapeamento de entidade → DTO
    // -------------------------------------------------------------------------

    private ArmadorDTO mapArmadorDTO(Armador a) {
        if (a == null) return null;
        return ArmadorDTO.builder()
                .id(a.getId())
                .nome(a.getNome())
                .nacionalidade(a.getNacionalidade())
                .endereco(a.getEndereco())
                .cep(a.getCep())
                .cnpj(a.getCnpj())
                .build();
    }

    private ConstrutorDTO mapConstrutorDTO(Construtor c) {
        if (c == null) return null;
        return ConstrutorDTO.builder()
                .id(c.getId())
                .nome(c.getNome())
                .nacionalidade(c.getNacionalidade())
                .endereco(c.getEndereco())
                .cep(c.getCep())
                .cnpj(c.getCnpj())
                .build();
    }

    private EngenheiroDTO mapEngenheiroDTO(EngenheiroResponsavel e) {
        if (e == null) return null;
        return EngenheiroDTO.builder()
                .id(e.getId())
                .nome(e.getNome())
                .nacionalidade(e.getNacionalidade())
                .crea(e.getCrea())
                .build();
    }

    private CaracteristicasCascoDTO mapCaracteristicasCascoDTO(CaracteristicasCasco c) {
        if (c == null) return null;
        return CaracteristicasCascoDTO.builder()
                .comprimentoTotal(c.getComprimentoTotal())
                .comprimentoEntrePerpendiculares(c.getComprimentoEntrePerpendiculares())
                .boca(c.getBoca())
                .pontal(c.getPontal())
                .calado(c.getCalado())
                .deslocamentoLeve(c.getDeslocamentoLeve())
                .deslocamentoCarregado(c.getDeslocamentoCarregado())
                .build();
    }

    private EstruturaDTO mapEstruturaDTO(Estrutura e) {
        if (e == null) return null;
        return EstruturaDTO.builder()
                .materialCasco(e.getMaterialCasco())
                .materialConves(e.getMaterialConves())
                .materialAnteparas(e.getMaterialAnteparas())
                .materialSuperestrutura(e.getMaterialSuperestrutura())
                .tipoEstrutura(e.getTipoEstrutura())
                .build();
    }

    private CompartimentagemDTO mapCompartimentagemDTO(Compartimentagem c) {
        if (c == null) return null;
        return CompartimentagemDTO.builder()
                .localSuperestrutura(c.getLocalSuperestrutura())
                .localPracaMaquinas(c.getLocalPracaMaquinas())
                .numeroAnteparasTransversais(c.getNumeroAnteparasTransversais())
                .numeroConveses(c.getNumeroConveses())
                .numeroCasarias(c.getNumeroCasarias())
                .build();
    }

    private List<PropulsaoDTO> mapPropulsoesDTO(List<Propulsao> propulsoes) {
        if (propulsoes == null) return new ArrayList<>();
        return propulsoes.stream()
                .map(p -> PropulsaoDTO.builder()
                        .id(p.getId())
                        .tipo(p.getTipo())
                        .marca(p.getMarca())
                        .potencia(p.getPotencia())
                        .quantidade(p.getQuantidade())
                        .rpm(p.getRpm())
                        .build())
                .collect(Collectors.toList());
    }

    private EnergiaDTO mapEnergiaDTO(Energia e) {
        if (e == null) return null;
        return EnergiaDTO.builder()
                .tipoMotor(e.getTipoMotor())
                .potenciaGerador(e.getPotenciaGerador())
                .quantidadeGeradores(e.getQuantidadeGeradores())
                .build();
    }

    private TripulacaoDTO mapTripulacaoDTO(Tripulacao t) {
        if (t == null) return null;
        return TripulacaoDTO.builder()
                .quantidadeTripulantes(t.getQuantidadeTripulantes())
                .quantidadePassageiros(t.getQuantidadePassageiros())
                .build();
    }

    private EquipamentosDTO mapEquipamentosDTO(Equipamentos e) {
        if (e == null) return null;
        return EquipamentosDTO.builder()
                .navegacao(e.getNavegacao())
                .comunicacao(e.getComunicacao())
                .seguranca(e.getSeguranca())
                .build();
    }

    private EmbarcacaoSummaryDTO projectionToSummaryDTO(EmbarcacaoSummaryProjection p) {
        return EmbarcacaoSummaryDTO.builder()
                .id(p.getId())
                .nome(p.getNome())
                .imagem(p.getImagem())
                .tipoEmbarcacao(p.getTipoEmbarcacao())
                .areaNavegacao(p.getAreaNavegacao())
                .portoRegistro(p.getPortoRegistro())
                .anoConstrucao(p.getAnoConstrucao())
                .createdAt(p.getCreatedAt())
                .build();
    }

    // -------------------------------------------------------------------------
    // Dashboard
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public EmbarcacaoDashboardDTO getDashboard(Long id) {
        Embarcacao embarcacao = embarcacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Embarcação não encontrada com id: " + id));

        // Última sondagem aprovada por tipo → percentual para TankLevel
        // (fallback: último registro CONSUMO aprovado)
        Integer combustivel = calcularPercentualSondagem(id, TipoTanque.COMBUSTIVEL);
        Integer agua = calcularPercentualSondagem(id, TipoTanque.AGUA);

        if (combustivel == null || agua == null) {
            List<RegistroOperacional> ultimoConsumo = registroRepository.findByEmbarcacaoIdAndTipoAndStatus(
                    id, TipoRegistro.CONSUMO, StatusRegistro.APROVADO, PageRequest.of(0, 1));
            if (!ultimoConsumo.isEmpty()) {
                if (combustivel == null) combustivel = ultimoConsumo.get(0).getNivelCombustivel();
                if (agua == null)        agua = ultimoConsumo.get(0).getNivelAgua();
            }
        }

        // Manobras (CHECKLIST aprovado)
        List<RegistroOperacional> checklistRegistros = registroRepository.findByEmbarcacaoIdAndTipoAndStatus(
                id, TipoRegistro.CHECKLIST, StatusRegistro.APROVADO, PageRequest.of(0, 50));

        // Manutenções aprovadas
        List<RegistroOperacional> manutencaoRegistros = registroRepository.findByEmbarcacaoIdAndTipoAndStatus(
                id, TipoRegistro.MANUTENCAO, StatusRegistro.APROVADO, PageRequest.of(0, 50));

        // Tripulação a bordo — derivada da escala ativa (turno aberto)
        List<EscalaTripulacao> escalasAtivas = escalaTripulacaoService.buscarAtivasPorEmbarcacao(id);

        List<EmbarcacaoDashboardDTO.MembroEscalaDTO> tripulacao = escalasAtivas.stream()
                .map(this::toMembroEscalaDTO)
                .collect(Collectors.toList());

        List<EmbarcacaoDashboardDTO.ComandanteDTO> comandantes = escalasAtivas.stream()
                .filter(e -> "comandante".equalsIgnoreCase(e.getFuncao()))
                .map(this::toComandanteDTO)
                .collect(Collectors.toList());

        // Manobras aprovadas (entidade Manobra)
        List<Manobra> manobrasAprovadas = manobraRepository
                .findByEmbarcacaoIdAndStatusOrderByDataHoraInicioDesc(
                        id, StatusManobra.APROVADO, PageRequest.of(0, 20));

        return EmbarcacaoDashboardDTO.builder()
                .id(embarcacao.getId())
                .nome(embarcacao.getNome())
                .imagem(embarcacao.getImagem())
                .tipo(embarcacao.getTipoEmbarcacao())
                .combustivel(combustivel)
                .agua(agua)
                .manobras(checklistRegistros.stream().map(this::toRegistroSummary).collect(Collectors.toList()))
                .manutencoes(manutencaoRegistros.stream().map(this::toRegistroSummary).collect(Collectors.toList()))
                .manobrasList(manobrasAprovadas.stream().map(this::toManobrasummaryDTO).collect(Collectors.toList()))
                .tripulacao(tripulacao)
                .comandantes(comandantes)
                .build();
    }

    /**
     * Calcula o percentual de preenchimento com base na última sondagem aprovada.
     * Retorna null quando não há sondagem registrada para este tipo.
     */
    private Integer calcularPercentualSondagem(Long embarcacaoId, TipoTanque tipo) {
        return sondagemRepository
                .findFirstByEmbarcacaoIdAndTipoAndStatusOrderByDataHoraDesc(
                        embarcacaoId, tipo, StatusSondagem.APROVADO)
                .map(s -> {
                    java.math.BigDecimal cap = s.getTanque().getCapacidade();
                    if (cap == null || cap.compareTo(java.math.BigDecimal.ZERO) == 0) return null;
                    return s.getVolumeLitros()
                            .multiply(java.math.BigDecimal.valueOf(100))
                            .divide(cap, 0, java.math.RoundingMode.HALF_UP)
                            .intValue();
                })
                .orElse(null);
    }

    private EmbarcacaoDashboardDTO.ManobrasummaryDTO toManobrasummaryDTO(Manobra m) {
        return EmbarcacaoDashboardDTO.ManobrasummaryDTO.builder()
                .id(m.getId())
                .tipoManobra(m.getTipoManobra())
                .localManobra(m.getLocalManobra())
                .navioOuCliente(m.getNavioOuCliente())
                .dataHoraInicio(m.getDataHoraInicio())
                .dataHoraFim(m.getDataHoraFim())
                .consumoCombustivel(m.getConsumoCombustivel())
                .aprovadoPor(m.getAprovadoPor() != null ? m.getAprovadoPor().getName() : null)
                .build();
    }

    private EmbarcacaoDashboardDTO.RegistroSummaryDTO toRegistroSummary(RegistroOperacional r) {
        return EmbarcacaoDashboardDTO.RegistroSummaryDTO.builder()
                .id(r.getId())
                .descricao(r.getDescricao())
                .dataRegistro(r.getDataRegistro())
                .dataAprovacao(r.getDataAprovacao())
                .aprovadoPor(r.getAprovadoPor() != null ? r.getAprovadoPor().getName() : null)
                .build();
    }

    private EmbarcacaoDashboardDTO.MembroEscalaDTO toMembroEscalaDTO(EscalaTripulacao e) {
        return EmbarcacaoDashboardDTO.MembroEscalaDTO.builder()
                .tripulanteId(e.getTripulante().getId())
                .nome(e.getTripulante().getNomeCompleto())
                .numeroCIR(e.getTripulante().getNumeroCIR())
                .funcao(e.getFuncao())
                .turno(e.getTurno().name())
                .turnoDescricao(e.getTurno().getDescricao())
                .dataInicio(e.getDataInicio())
                .build();
    }

    private EmbarcacaoDashboardDTO.ComandanteDTO toComandanteDTO(EscalaTripulacao e) {
        return EmbarcacaoDashboardDTO.ComandanteDTO.builder()
                .tripulanteId(e.getTripulante().getId())
                .nome(e.getTripulante().getNomeCompleto())
                .turno(e.getTurno().name())
                .turnoDescricao(e.getTurno().getDescricao())
                .dataInicio(e.getDataInicio())
                .build();
    }
}
