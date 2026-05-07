package com.seaport.service;

import com.seaport.dto.tripulante.TripulanteRequestDTO;
import com.seaport.dto.tripulante.TripulanteResponseDTO;
import com.seaport.entity.Embarcacao;
import com.seaport.entity.TipoDocumentoTripulante;
import com.seaport.entity.Tripulante;
import com.seaport.repository.EmbarcacaoRepository;
import com.seaport.repository.TripulanteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripulanteService {

    private final TripulanteRepository tripulanteRepository;
    private final EmbarcacaoRepository embarcacaoRepository;
    private final StorageService storageService;

    // -------------------------------------------------------------------------
    // Leitura
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('GERENTE','DIRETORIA')")
    public Page<TripulanteResponseDTO> listarComFiltros(Long embarcacaoId, Boolean ativo,
                                                        String nome, Pageable pageable) {
        return tripulanteRepository
                .buscarComFiltros(embarcacaoId, ativo, nome, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('GERENTE','DIRETORIA')")
    public List<TripulanteResponseDTO> listarPorEmbarcacao(Long embarcacaoId) {
        if (!embarcacaoRepository.existsById(embarcacaoId)) {
            throw new EntityNotFoundException("Embarcação não encontrada: " + embarcacaoId);
        }
        return tripulanteRepository
                .findByEmbarcacaoIdOrderByNomeCompletoAsc(embarcacaoId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('GERENTE','DIRETORIA')")
    public TripulanteResponseDTO buscarPorId(Long id) {
        return toDTO(findById(id));
    }

    // -------------------------------------------------------------------------
    // Escrita
    // -------------------------------------------------------------------------

    /**
     * Cria tripulante. O arquivo CIR (foto ou PDF) é opcional e,
     * quando fornecido, é armazenado imediatamente junto com o cadastro.
     */
    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public TripulanteResponseDTO criar(TripulanteRequestDTO dto, MultipartFile arquivo) throws IOException {
        validarCIR(dto.getNumeroCIR(), null);

        // Armazena o arquivo primeiro (UUID → não precisa de ID da entidade)
        String relativePath = null;
        TipoDocumentoTripulante tipoDoc = null;
        if (arquivo != null && !arquivo.isEmpty()) {
            relativePath = storageService.store(arquivo, "tripulantes");
            tipoDoc = resolverTipoDocumento(arquivo.getContentType());
        }

        Tripulante t = Tripulante.builder()
                .embarcacao(resolveEmbarcacao(dto.getEmbarcacaoId()))
                .nomeCompleto(dto.getNomeCompleto())
                .numeroCIR(dto.getNumeroCIR())
                .dataVencimentoCIR(dto.getDataVencimentoCIR())
                .categoria(dto.getCategoria())
                .funcaoBase(dto.getFuncaoBase())
                .dataEntradaEmpresa(dto.getDataEntradaEmpresa())
                .documentoUrl(relativePath)
                .tipoDocumento(tipoDoc)
                .ativo(true)
                .build();

        return toDTO(tripulanteRepository.save(t));
    }

    /**
     * Atualiza tripulante. Se um novo arquivo for enviado, o anterior é removido do disco.
     */
    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public TripulanteResponseDTO atualizar(Long id, TripulanteRequestDTO dto, MultipartFile arquivo) throws IOException {
        Tripulante t = findById(id);
        validarCIR(dto.getNumeroCIR(), id);

        t.setEmbarcacao(resolveEmbarcacao(dto.getEmbarcacaoId()));
        t.setNomeCompleto(dto.getNomeCompleto());
        t.setNumeroCIR(dto.getNumeroCIR());
        t.setDataVencimentoCIR(dto.getDataVencimentoCIR());
        t.setCategoria(dto.getCategoria());
        t.setFuncaoBase(dto.getFuncaoBase());
        t.setDataEntradaEmpresa(dto.getDataEntradaEmpresa());

        if (arquivo != null && !arquivo.isEmpty()) {
            if (t.getDocumentoUrl() != null) storageService.delete(t.getDocumentoUrl());
            t.setDocumentoUrl(storageService.store(arquivo, "tripulantes"));
            t.setTipoDocumento(resolverTipoDocumento(arquivo.getContentType()));
        }

        return toDTO(tripulanteRepository.save(t));
    }

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public TripulanteResponseDTO inativar(Long id) {
        Tripulante t = findById(id);
        if (!t.isAtivo()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tripulante já está inativo.");
        }
        t.setAtivo(false);
        return toDTO(tripulanteRepository.save(t));
    }

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public TripulanteResponseDTO ativar(Long id) {
        Tripulante t = findById(id);
        if (t.isAtivo()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tripulante já está ativo.");
        }
        t.setAtivo(true);
        return toDTO(tripulanteRepository.save(t));
    }

    /** Substitui o documento CIR por um novo arquivo (endpoint dedicado). */
    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public TripulanteResponseDTO uploadDocumento(Long id, MultipartFile file) throws IOException {
        Tripulante t = findById(id);
        if (t.getDocumentoUrl() != null) {
            storageService.delete(t.getDocumentoUrl());
        }
        t.setDocumentoUrl(storageService.store(file, "tripulantes"));
        t.setTipoDocumento(resolverTipoDocumento(file.getContentType()));
        return toDTO(tripulanteRepository.save(t));
    }

    // -------------------------------------------------------------------------
    // Helpers internos
    // -------------------------------------------------------------------------

    public Tripulante findById(Long id) {
        return tripulanteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tripulante não encontrado: " + id));
    }

    private Embarcacao resolveEmbarcacao(Long embarcacaoId) {
        if (embarcacaoId == null) return null;
        return embarcacaoRepository.findById(embarcacaoId)
                .orElseThrow(() -> new EntityNotFoundException("Embarcação não encontrada: " + embarcacaoId));
    }

    private void validarCIR(String cir, Long idIgnorar) {
        if (cir == null || cir.isBlank()) return;
        boolean duplicado = (idIgnorar == null)
                ? tripulanteRepository.existsByNumeroCIR(cir)
                : tripulanteRepository.existsByNumeroCIRAndIdNot(cir, idIgnorar);
        if (duplicado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um tripulante com o CIR: " + cir);
        }
    }

    private TipoDocumentoTripulante resolverTipoDocumento(String contentType) {
        if (contentType == null) return null;
        return contentType.contains("pdf")
                ? TipoDocumentoTripulante.PDF
                : TipoDocumentoTripulante.IMAGEM;
    }

    public TripulanteResponseDTO toDTO(Tripulante t) {
        return TripulanteResponseDTO.builder()
                .id(t.getId())
                .embarcacaoId(t.getEmbarcacao() != null ? t.getEmbarcacao().getId() : null)
                .embarcacaoNome(t.getEmbarcacao() != null ? t.getEmbarcacao().getNome() : null)
                .nomeCompleto(t.getNomeCompleto())
                .numeroCIR(t.getNumeroCIR())
                .dataVencimentoCIR(t.getDataVencimentoCIR())
                .categoria(t.getCategoria())
                .funcaoBase(t.getFuncaoBase())
                .dataEntradaEmpresa(t.getDataEntradaEmpresa())
                .documentoUrl(t.getDocumentoUrl())
                .tipoDocumento(t.getTipoDocumento())
                .ativo(t.isAtivo())
                .dataCadastro(t.getDataCadastro())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
