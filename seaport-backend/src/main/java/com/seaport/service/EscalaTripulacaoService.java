package com.seaport.service;

import com.seaport.dto.tripulante.EscalaRequestDTO;
import com.seaport.dto.tripulante.EscalaResponseDTO;
import com.seaport.entity.Embarcacao;
import com.seaport.entity.EscalaTripulacao;
import com.seaport.entity.Tripulante;
import com.seaport.entity.Turno;
import com.seaport.repository.EmbarcacaoRepository;
import com.seaport.repository.EscalaTripulacaoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EscalaTripulacaoService {

    private static final String FUNCAO_COMANDANTE = "comandante";

    private final EscalaTripulacaoRepository escalaRepository;
    private final TripulanteService tripulanteService;
    private final EmbarcacaoRepository embarcacaoRepository;

    // -------------------------------------------------------------------------
    // Leitura
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('GERENTE','DIRETORIA')")
    public List<EscalaResponseDTO> listarAtivaPorEmbarcacao(Long embarcacaoId) {
        validarEmbarcacao(embarcacaoId);
        return escalaRepository
                .findByEmbarcacaoIdAndAtivoTrueAndDataFimIsNullOrderByTurnoAscFuncaoAsc(embarcacaoId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('GERENTE','DIRETORIA')")
    public List<EscalaResponseDTO> listarHistoricoPorEmbarcacao(Long embarcacaoId) {
        validarEmbarcacao(embarcacaoId);
        return escalaRepository
                .findByEmbarcacaoIdOrderByDataInicioDesc(embarcacaoId)
                .stream().map(this::toDTO).toList();
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public EscalaResponseDTO criar(EscalaRequestDTO dto) {
        Tripulante tripulante = tripulanteService.findById(dto.getTripulanteId());
        Embarcacao embarcacao = resolveEmbarcacao(dto.getEmbarcacaoId());

        validarSobreposicaoTripulante(dto.getTripulanteId(), dto.getTurno(), null);

        if (isComandante(dto.getFuncao())) {
            validarComandanteUnico(dto.getEmbarcacaoId(), dto.getTurno(), null);
        }

        EscalaTripulacao escala = EscalaTripulacao.builder()
                .tripulante(tripulante)
                .embarcacao(embarcacao)
                .funcao(dto.getFuncao())
                .turno(dto.getTurno())
                .dataInicio(dto.getDataInicio())
                .dataFim(dto.getDataFim())
                .ativo(true)
                .build();

        return toDTO(escalaRepository.save(escala));
    }

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public EscalaResponseDTO atualizar(Long id, EscalaRequestDTO dto) {
        EscalaTripulacao escala = findById(id);

        validarSobreposicaoTripulante(dto.getTripulanteId(), dto.getTurno(), id);

        if (isComandante(dto.getFuncao())) {
            validarComandanteUnico(dto.getEmbarcacaoId(), dto.getTurno(), id);
        }

        Tripulante tripulante = tripulanteService.findById(dto.getTripulanteId());
        Embarcacao embarcacao = resolveEmbarcacao(dto.getEmbarcacaoId());

        escala.setTripulante(tripulante);
        escala.setEmbarcacao(embarcacao);
        escala.setFuncao(dto.getFuncao());
        escala.setTurno(dto.getTurno());
        escala.setDataInicio(dto.getDataInicio());
        escala.setDataFim(dto.getDataFim());

        return toDTO(escalaRepository.save(escala));
    }

    /**
     * Encerra o turno: registra dataFim=hoje e ativo=false.
     * Preserva o registro no histórico.
     */
    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public EscalaResponseDTO encerrar(Long id) {
        EscalaTripulacao escala = findById(id);
        if (!escala.isAtivo()) {
            throw new IllegalStateException("Esta escala já foi encerrada");
        }
        escala.setAtivo(false);
        escala.setDataFim(LocalDate.now());
        return toDTO(escalaRepository.save(escala));
    }

    // -------------------------------------------------------------------------
    // Helper público — usado pelo EmbarcacaoService.getDashboard()
    // -------------------------------------------------------------------------

    public List<EscalaTripulacao> buscarAtivasPorEmbarcacao(Long embarcacaoId) {
        return escalaRepository
                .findByEmbarcacaoIdAndAtivoTrueAndDataFimIsNullOrderByTurnoAscFuncaoAsc(embarcacaoId);
    }

    // -------------------------------------------------------------------------
    // Validações de negócio
    // -------------------------------------------------------------------------

    private void validarSobreposicaoTripulante(Long tripulanteId, Turno turno, Long idIgnorar) {
        boolean existe = (idIgnorar == null)
                ? escalaRepository.existsByTripulanteIdAndTurnoAndAtivoTrueAndDataFimIsNull(tripulanteId, turno)
                : escalaRepository.existsByTripulanteIdAndTurnoAndAtivoTrueAndDataFimIsNullAndIdNot(
                        tripulanteId, turno, idIgnorar);
        if (existe) {
            throw new IllegalArgumentException(
                "Tripulante já possui escala ativa para " + turno.getDescricao()
                + ". Encerre o turno vigente antes de criar um novo.");
        }
    }

    private void validarComandanteUnico(Long embarcacaoId, Turno turno, Long idIgnorar) {
        boolean existe = (idIgnorar == null)
                ? escalaRepository.existsComandanteAtivoNoTurno(embarcacaoId, FUNCAO_COMANDANTE, turno)
                : escalaRepository.existsComandanteAtivoNoTurnoExcluindo(embarcacaoId, FUNCAO_COMANDANTE, turno, idIgnorar);
        if (existe) {
            throw new IllegalArgumentException(
                "Já existe um Comandante ativo no " + turno.getDescricao()
                + " para esta embarcação. Encerre o turno vigente primeiro.");
        }
    }

    private boolean isComandante(String funcao) {
        return funcao != null && funcao.trim().equalsIgnoreCase(FUNCAO_COMANDANTE);
    }

    // -------------------------------------------------------------------------
    // Internos
    // -------------------------------------------------------------------------

    private EscalaTripulacao findById(Long id) {
        return escalaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Escala não encontrada: " + id));
    }

    private Embarcacao resolveEmbarcacao(Long id) {
        return embarcacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Embarcação não encontrada: " + id));
    }

    private void validarEmbarcacao(Long id) {
        if (!embarcacaoRepository.existsById(id)) {
            throw new EntityNotFoundException("Embarcação não encontrada: " + id);
        }
    }

    public EscalaResponseDTO toDTO(EscalaTripulacao e) {
        return EscalaResponseDTO.builder()
                .id(e.getId())
                .tripulanteId(e.getTripulante().getId())
                .tripulanteNome(e.getTripulante().getNomeCompleto())
                .tripulanteCIR(e.getTripulante().getNumeroCIR())
                .embarcacaoId(e.getEmbarcacao().getId())
                .embarcacaoNome(e.getEmbarcacao().getNome())
                .funcao(e.getFuncao())
                .turno(e.getTurno())
                .turnoDescricao(e.getTurno().getDescricao())
                .dataInicio(e.getDataInicio())
                .dataFim(e.getDataFim())
                .ativo(e.isAtivo())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
