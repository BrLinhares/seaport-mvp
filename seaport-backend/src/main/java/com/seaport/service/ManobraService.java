package com.seaport.service;

import com.seaport.dto.manobra.ManobraRequestDTO;
import com.seaport.dto.manobra.ManobraResponseDTO;
import com.seaport.dto.manobra.RejeicaoManobraRequestDTO;
import com.seaport.entity.*;
import com.seaport.repository.EmbarcacaoRepository;
import com.seaport.repository.ManobraRepository;
import com.seaport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManobraService {

    private final ManobraRepository manobraRepository;
    private final EmbarcacaoRepository embarcacaoRepository;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // Consultas
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('GERENTE')")
    public List<ManobraResponseDTO> listarTodas() {
        return manobraRepository.findAllByOrderByDataHoraInicioDesc()
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('TRIPULACAO')")
    public List<ManobraResponseDTO> listarMinhaEmbarcacao(Authentication auth) {
        User user = findUser(auth);
        if (user.getEmbarcacao() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Você não está vinculado a nenhuma embarcação.");
        }
        return manobraRepository
                .findByEmbarcacaoIdOrderByDataHoraInicioDesc(user.getEmbarcacao().getId())
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('DIRETORIA', 'GERENTE')")
    public List<ManobraResponseDTO> listarAprovadas() {
        return manobraRepository.findByStatusOrderByDataHoraInicioDesc(StatusManobra.APROVADO)
                .stream().map(this::toDTO).toList();
    }

    // -------------------------------------------------------------------------
    // Criação
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('TRIPULACAO')")
    public ManobraResponseDTO criar(ManobraRequestDTO dto, Authentication auth) {
        User user = findUser(auth);

        if (user.getEmbarcacao() == null ||
            !user.getEmbarcacao().getId().equals(dto.getEmbarcacaoId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você só pode registrar manobras para a sua embarcação.");
        }

        if (!dto.getDataHoraFim().isAfter(dto.getDataHoraInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A data/hora de fim deve ser posterior ao início.");
        }

        Embarcacao embarcacao = embarcacaoRepository.findById(dto.getEmbarcacaoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Embarcação não encontrada."));

        Manobra manobra = Manobra.builder()
                .embarcacao(embarcacao)
                .usuario(user)
                .localManobra(dto.getLocalManobra())
                .navioOuCliente(dto.getNavioOuCliente())
                .tipoManobra(dto.getTipoManobra())
                .dataHoraInicio(dto.getDataHoraInicio())
                .dataHoraFim(dto.getDataHoraFim())
                .consumoCombustivel(dto.getConsumoCombustivel())
                .observacoes(dto.getObservacoes())
                .status(StatusManobra.PENDENTE)
                .build();

        return toDTO(manobraRepository.save(manobra));
    }

    // -------------------------------------------------------------------------
    // Aprovação / Rejeição (GERENTE)
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public ManobraResponseDTO aprovar(Long id, Authentication auth) {
        Manobra m = findById(id);
        if (m.getStatus() != StatusManobra.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Apenas manobras PENDENTES podem ser aprovadas. Status atual: " + m.getStatus());
        }
        m.setStatus(StatusManobra.APROVADO);
        m.setDataAprovacao(LocalDateTime.now());
        m.setAprovadoPor(findUser(auth));
        return toDTO(manobraRepository.save(m));
    }

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public ManobraResponseDTO rejeitar(Long id, RejeicaoManobraRequestDTO dto, Authentication auth) {
        Manobra m = findById(id);
        if (m.getStatus() != StatusManobra.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Apenas manobras PENDENTES podem ser rejeitadas. Status atual: " + m.getStatus());
        }
        m.setStatus(StatusManobra.REJEITADO);
        m.setMotivoRejeicao(dto.getMotivo());
        m.setAprovadoPor(findUser(auth));
        m.setDataAprovacao(LocalDateTime.now());
        return toDTO(manobraRepository.save(m));
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    private Manobra findById(Long id) {
        return manobraRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Manobra não encontrada."));
    }

    private User findUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Usuário não encontrado."));
    }

    public ManobraResponseDTO toDTO(Manobra m) {
        return ManobraResponseDTO.builder()
                .id(m.getId())
                .embarcacaoId(m.getEmbarcacao().getId())
                .embarcacaoNome(m.getEmbarcacao().getNome())
                .usuarioNome(m.getUsuario().getName())
                .localManobra(m.getLocalManobra())
                .navioOuCliente(m.getNavioOuCliente())
                .tipoManobra(m.getTipoManobra())
                .dataHoraInicio(m.getDataHoraInicio())
                .dataHoraFim(m.getDataHoraFim())
                .consumoCombustivel(m.getConsumoCombustivel())
                .observacoes(m.getObservacoes())
                .status(m.getStatus())
                .dataAprovacao(m.getDataAprovacao())
                .aprovadoPorNome(m.getAprovadoPor() != null ? m.getAprovadoPor().getName() : null)
                .motivoRejeicao(m.getMotivoRejeicao())
                .dataCadastro(m.getDataCadastro())
                .build();
    }
}
