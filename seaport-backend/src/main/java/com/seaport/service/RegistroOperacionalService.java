package com.seaport.service;

import com.seaport.dto.registro.AprovarRejeitarDTO;
import com.seaport.dto.registro.RegistroRequestDTO;
import com.seaport.dto.registro.RegistroResponseDTO;
import com.seaport.entity.*;
import com.seaport.repository.EmbarcacaoRepository;
import com.seaport.repository.RegistroOperacionalRepository;
import com.seaport.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistroOperacionalService {

    private final RegistroOperacionalRepository registroRepository;
    private final EmbarcacaoRepository embarcacaoRepository;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // TRIPULAÇÃO — criar registro
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('TRIPULACAO')")
    public RegistroResponseDTO criar(RegistroRequestDTO dto, String emailCriador) {
        User criador = findUserByEmail(emailCriador);

        if (criador.getEmbarcacao() == null) {
            throw new IllegalStateException("Usuário não está vinculado a nenhuma embarcação");
        }

        RegistroOperacional registro = RegistroOperacional.builder()
                .embarcacao(criador.getEmbarcacao())
                .criador(criador)
                .tipo(dto.getTipo())
                .descricao(dto.getDescricao())
                .dataRegistro(dto.getDataRegistro())
                .nivelCombustivel(dto.getNivelCombustivel())
                .nivelAgua(dto.getNivelAgua())
                .status(StatusRegistro.PENDENTE)
                .build();

        registro = registroRepository.save(registro);
        log.info("Registro criado por {} para embarcação {}", emailCriador, criador.getEmbarcacao().getNome());
        return toDTO(registro);
    }

    // -------------------------------------------------------------------------
    // TRIPULAÇÃO — listar da sua embarcação
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('TRIPULACAO')")
    public List<RegistroResponseDTO> listarMinhaEmbarcacao(String emailUsuario) {
        User usuario = findUserByEmail(emailUsuario);

        if (usuario.getEmbarcacao() == null) {
            throw new IllegalStateException("Usuário não está vinculado a nenhuma embarcação");
        }

        return registroRepository.findByEmbarcacaoId(usuario.getEmbarcacao().getId())
                .stream().map(this::toDTO).toList();
    }

    // -------------------------------------------------------------------------
    // GERENTE — listar todos (com filtro por status)
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('GERENTE', 'DIRETORIA')")
    public Page<RegistroResponseDTO> listarTodos(StatusRegistro status, Pageable pageable) {
        Page<RegistroOperacional> page = (status != null)
                ? registroRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : registroRepository.findAllByOrderByCreatedAtDesc(pageable);

        return page.map(this::toDTO);
    }

    // -------------------------------------------------------------------------
    // DIRETORIA — apenas aprovados
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('DIRETORIA', 'GERENTE')")
    public List<RegistroResponseDTO> listarAprovados() {
        return registroRepository.findByStatusOrderByDataAprovacaoDesc(StatusRegistro.APROVADO)
                .stream().map(this::toDTO).toList();
    }

    // -------------------------------------------------------------------------
    // GERENTE — aprovar
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public RegistroResponseDTO aprovar(Long id, String emailGerente) {
        RegistroOperacional registro = findById(id);
        validarTransicao(registro, StatusRegistro.APROVADO);

        User gerente = findUserByEmail(emailGerente);
        registro.setStatus(StatusRegistro.APROVADO);
        registro.setDataAprovacao(LocalDateTime.now());
        registro.setAprovadoPor(gerente);
        registro.setMotivoRejeicao(null);

        log.info("Registro {} aprovado por {}", id, emailGerente);
        return toDTO(registroRepository.save(registro));
    }

    // -------------------------------------------------------------------------
    // GERENTE — rejeitar
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public RegistroResponseDTO rejeitar(Long id, AprovarRejeitarDTO dto, String emailGerente) {
        if (dto.getMotivoRejeicao() == null || dto.getMotivoRejeicao().isBlank()) {
            throw new IllegalArgumentException("Motivo de rejeição é obrigatório");
        }

        RegistroOperacional registro = findById(id);
        validarTransicao(registro, StatusRegistro.REJEITADO);

        User gerente = findUserByEmail(emailGerente);
        registro.setStatus(StatusRegistro.REJEITADO);
        registro.setDataAprovacao(LocalDateTime.now());
        registro.setAprovadoPor(gerente);
        registro.setMotivoRejeicao(dto.getMotivoRejeicao());

        log.info("Registro {} rejeitado por {}: {}", id, emailGerente, dto.getMotivoRejeicao());
        return toDTO(registroRepository.save(registro));
    }

    // -------------------------------------------------------------------------
    // Regras da state machine
    // -------------------------------------------------------------------------

    private void validarTransicao(RegistroOperacional registro, StatusRegistro novoStatus) {
        if (registro.getStatus() != StatusRegistro.PENDENTE) {
            throw new IllegalStateException(
                "Registro já foi " + registro.getStatus().name().toLowerCase() +
                " e não pode ser alterado novamente"
            );
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private RegistroOperacional findById(Long id) {
        return registroRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Registro não encontrado: " + id));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + email));
    }

    private RegistroResponseDTO toDTO(RegistroOperacional r) {
        return RegistroResponseDTO.builder()
                .id(r.getId())
                .embarcacaoId(r.getEmbarcacao().getId())
                .embarcacaoNome(r.getEmbarcacao().getNome())
                .criadorId(r.getCriador().getId())
                .criadorNome(r.getCriador().getName())
                .tipo(r.getTipo())
                .descricao(r.getDescricao())
                .dataRegistro(r.getDataRegistro())
                .status(r.getStatus())
                .dataAprovacao(r.getDataAprovacao())
                .aprovadoPorNome(r.getAprovadoPor() != null ? r.getAprovadoPor().getName() : null)
                .motivoRejeicao(r.getMotivoRejeicao())
                .nivelCombustivel(r.getNivelCombustivel())
                .nivelAgua(r.getNivelAgua())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
