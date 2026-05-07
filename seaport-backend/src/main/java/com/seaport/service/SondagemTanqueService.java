package com.seaport.service;

import com.seaport.dto.sondagem.RejeicaoRequestDTO;
import com.seaport.dto.sondagem.SondagemRequestDTO;
import com.seaport.dto.sondagem.SondagemResponseDTO;
import com.seaport.entity.*;
import com.seaport.repository.EmbarcacaoRepository;
import com.seaport.repository.SondagemTanqueRepository;
import com.seaport.repository.TanqueRepository;
import com.seaport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SondagemTanqueService {

    private final SondagemTanqueRepository sondagemRepository;
    private final EmbarcacaoRepository embarcacaoRepository;
    private final TanqueRepository tanqueRepository;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // Consultas
    // -------------------------------------------------------------------------

    /** GERENTE: todas as sondagens do sistema. */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('GERENTE')")
    public List<SondagemResponseDTO> listarTodas() {
        return sondagemRepository.findAllByOrderByDataHoraDesc().stream()
                .map(this::toDTO).toList();
    }

    /** TRIPULACAO: sondagens da sua embarcação. */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('TRIPULACAO')")
    public List<SondagemResponseDTO> listarMinhaEmbarcacao(Authentication auth) {
        User user = findUser(auth);
        if (user.getEmbarcacao() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Você não está vinculado a nenhuma embarcação.");
        }
        return sondagemRepository
                .findByEmbarcacaoIdOrderByDataHoraDesc(user.getEmbarcacao().getId())
                .stream().map(this::toDTO).toList();
    }

    /** DIRETORIA: somente sondagens aprovadas. */
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('DIRETORIA','GERENTE')")
    public List<SondagemResponseDTO> listarAprovadas() {
        return sondagemRepository.findByStatusOrderByDataHoraDesc(StatusSondagem.APROVADO)
                .stream().map(this::toDTO).toList();
    }

    // -------------------------------------------------------------------------
    // Criação
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('TRIPULACAO')")
    public SondagemResponseDTO criar(SondagemRequestDTO dto, Authentication auth) {
        User user = findUser(auth);

        // TRIPULACAO só pode registrar na sua própria embarcação
        if (user.getEmbarcacao() == null ||
            !user.getEmbarcacao().getId().equals(dto.getEmbarcacaoId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você só pode registrar sondagens para a sua embarcação.");
        }

        Embarcacao embarcacao = embarcacaoRepository.findById(dto.getEmbarcacaoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Embarcação não encontrada."));

        Tanque tanque = tanqueRepository.findById(dto.getTanqueId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Tanque não encontrado."));

        // Tanque deve pertencer à embarcação
        if (!tanque.getEmbarcacao().getId().equals(dto.getEmbarcacaoId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "O tanque selecionado não pertence a esta embarcação.");
        }

        // Tipo da sondagem deve corresponder ao tipo do tanque
        if (!tanque.getTipo().equals(dto.getTipo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tipo incompatível: o tanque é de " + tanque.getTipo().name() +
                    " mas a sondagem foi registrada como " + dto.getTipo().name() + ".");
        }

        // Volume deve estar entre 0 e capacidade do tanque
        if (dto.getVolumeLitros().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Volume não pode ser negativo.");
        }
        if (dto.getVolumeLitros().compareTo(tanque.getCapacidade()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Volume (" + dto.getVolumeLitros() + " L) excede a capacidade do tanque (" +
                    tanque.getCapacidade() + " L).");
        }

        SondagemTanque sondagem = SondagemTanque.builder()
                .embarcacao(embarcacao)
                .tanque(tanque)
                .usuario(user)
                .tipo(dto.getTipo())
                .volumeLitros(dto.getVolumeLitros())
                .dataHora(dto.getDataHora())
                .status(StatusSondagem.PENDENTE)
                .build();

        return toDTO(sondagemRepository.save(sondagem));
    }

    // -------------------------------------------------------------------------
    // Aprovação / Rejeição (GERENTE)
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public SondagemResponseDTO aprovar(Long id, Authentication auth) {
        SondagemTanque s = findById(id);
        if (s.getStatus() != StatusSondagem.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Apenas sondagens PENDENTES podem ser aprovadas. Status atual: " + s.getStatus());
        }
        s.setStatus(StatusSondagem.APROVADO);
        s.setDataAprovacao(LocalDateTime.now());
        s.setAprovadoPor(findUser(auth));
        return toDTO(sondagemRepository.save(s));
    }

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public SondagemResponseDTO rejeitar(Long id, RejeicaoRequestDTO dto, Authentication auth) {
        SondagemTanque s = findById(id);
        if (s.getStatus() != StatusSondagem.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Apenas sondagens PENDENTES podem ser rejeitadas. Status atual: " + s.getStatus());
        }
        s.setStatus(StatusSondagem.REJEITADO);
        s.setMotivoRejeicao(dto.getMotivo());
        s.setAprovadoPor(findUser(auth));
        s.setDataAprovacao(LocalDateTime.now());
        return toDTO(sondagemRepository.save(s));
    }

    // -------------------------------------------------------------------------
    // Helper para dashboard
    // -------------------------------------------------------------------------

    /**
     * Retorna o percentual de preenchimento da última sondagem aprovada
     * para o tipo solicitado. Retorna null se não houver sondagem.
     */
    @Transactional(readOnly = true)
    public Integer ultimoPercentualAprovado(Long embarcacaoId, TipoTanque tipo) {
        return sondagemRepository
                .findFirstByEmbarcacaoIdAndTipoAndStatusOrderByDataHoraDesc(
                        embarcacaoId, tipo, StatusSondagem.APROVADO)
                .map(s -> calcularPercentual(s.getVolumeLitros(), s.getTanque().getCapacidade()))
                .orElse(null);
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    private SondagemTanque findById(Long id) {
        return sondagemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Sondagem não encontrada."));
    }

    private User findUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Usuário não encontrado."));
    }

    private String extractRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .findFirst().orElse("");
    }

    private Integer calcularPercentual(BigDecimal volume, BigDecimal capacidade) {
        if (capacidade == null || capacidade.compareTo(BigDecimal.ZERO) == 0) return null;
        return volume.multiply(BigDecimal.valueOf(100))
                .divide(capacidade, 0, RoundingMode.HALF_UP)
                .intValue();
    }

    public SondagemResponseDTO toDTO(SondagemTanque s) {
        Tanque tanque = s.getTanque();
        Integer pct = calcularPercentual(s.getVolumeLitros(), tanque.getCapacidade());

        return SondagemResponseDTO.builder()
                .id(s.getId())
                .embarcacaoId(s.getEmbarcacao().getId())
                .embarcacaoNome(s.getEmbarcacao().getNome())
                .tanqueId(tanque.getId())
                .tanqueNome(tanque.getNome())
                .tanqueCapacidade(tanque.getCapacidade())
                .tanqueUnidade(tanque.getUnidade())
                .tipo(s.getTipo())
                .volumeLitros(s.getVolumeLitros())
                .percentual(pct)
                .dataHora(s.getDataHora())
                .status(s.getStatus())
                .dataAprovacao(s.getDataAprovacao())
                .aprovadoPorNome(s.getAprovadoPor() != null ? s.getAprovadoPor().getName() : null)
                .motivoRejeicao(s.getMotivoRejeicao())
                .usuarioNome(s.getUsuario().getName())
                .dataCadastro(s.getDataCadastro())
                .build();
    }
}
