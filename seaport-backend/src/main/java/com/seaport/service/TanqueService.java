package com.seaport.service;

import com.seaport.dto.tanque.TanqueCreateDTO;
import com.seaport.dto.tanque.TanqueDTO;
import com.seaport.dto.tanque.TanqueResponseDTO;
import com.seaport.entity.Embarcacao;
import com.seaport.entity.Tanque;
import com.seaport.repository.EmbarcacaoRepository;
import com.seaport.repository.TanqueRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TanqueService {

    private final TanqueRepository tanqueRepository;
    private final EmbarcacaoRepository embarcacaoRepository;

    // -------------------------------------------------------------------------
    // Listagem
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public List<TanqueResponseDTO> listarPorEmbarcacao(Long embarcacaoId) {
        if (!embarcacaoRepository.existsById(embarcacaoId)) {
            throw new EntityNotFoundException("Embarcação não encontrada com id: " + embarcacaoId);
        }
        return tanqueRepository.findByEmbarcacaoIdOrderByTipoAscNomeAsc(embarcacaoId)
                .stream().map(this::toDTO).toList();
    }

    // -------------------------------------------------------------------------
    // Criação avulsa
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public TanqueResponseDTO criar(TanqueCreateDTO dto) {
        Embarcacao embarcacao = embarcacaoRepository.findById(dto.getEmbarcacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Embarcação não encontrada com id: " + dto.getEmbarcacaoId()));

        validarNomeUnico(embarcacao.getId(), dto.getNome(), null);

        Tanque tanque = Tanque.builder()
                .embarcacao(embarcacao)
                .nome(dto.getNome())
                .tipo(dto.getTipo())
                .capacidade(dto.getCapacidade())
                .unidade(dto.getUnidade())
                .localizacao(dto.getLocalizacao())
                .build();

        return toDTO(tanqueRepository.save(tanque));
    }

    // -------------------------------------------------------------------------
    // Atualização avulsa
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public TanqueResponseDTO atualizar(Long id, TanqueDTO dto) {
        Tanque tanque = findById(id);

        validarNomeUnico(tanque.getEmbarcacao().getId(), dto.getNome(), id);

        tanque.setNome(dto.getNome());
        tanque.setTipo(dto.getTipo());
        tanque.setCapacidade(dto.getCapacidade());
        tanque.setUnidade(dto.getUnidade());
        tanque.setLocalizacao(dto.getLocalizacao());

        return toDTO(tanqueRepository.save(tanque));
    }

    // -------------------------------------------------------------------------
    // Exclusão avulsa
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public void excluir(Long id) {
        if (!tanqueRepository.existsById(id)) {
            throw new EntityNotFoundException("Tanque não encontrado com id: " + id);
        }
        tanqueRepository.deleteById(id);
    }

    // -------------------------------------------------------------------------
    // Helpers internos (usados pelo EmbarcacaoService ao salvar inline)
    // -------------------------------------------------------------------------

    /**
     * Converte um TanqueDTO inline para entidade já vinculada à embarcação.
     * Não persiste — o cascade da embarcação cuida disso.
     */
    public Tanque fromDTO(TanqueDTO dto, Embarcacao embarcacao) {
        return Tanque.builder()
                .embarcacao(embarcacao)
                .nome(dto.getNome())
                .tipo(dto.getTipo())
                .capacidade(dto.getCapacidade())
                .unidade(dto.getUnidade())
                .localizacao(dto.getLocalizacao())
                .build();
    }

    // -------------------------------------------------------------------------
    // Validações
    // -------------------------------------------------------------------------

    private void validarNomeUnico(Long embarcacaoId, String nome, Long idIgnorar) {
        if (nome == null || nome.isBlank()) return;
        boolean duplicado = (idIgnorar == null)
                ? tanqueRepository.existsByEmbarcacaoIdAndNomeIgnoreCase(embarcacaoId, nome)
                : tanqueRepository.existsByEmbarcacaoIdAndNomeIgnoreCaseAndIdNot(embarcacaoId, nome, idIgnorar);

        if (duplicado) {
            throw new IllegalArgumentException(
                "Já existe um tanque com o nome '" + nome + "' nesta embarcação"
            );
        }
    }

    private Tanque findById(Long id) {
        return tanqueRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tanque não encontrado com id: " + id));
    }

    // -------------------------------------------------------------------------
    // Mapeamento
    // -------------------------------------------------------------------------

    public TanqueResponseDTO toDTO(Tanque t) {
        return TanqueResponseDTO.builder()
                .id(t.getId())
                .embarcacaoId(t.getEmbarcacao().getId())
                .embarcacaoNome(t.getEmbarcacao().getNome())
                .nome(t.getNome())
                .tipo(t.getTipo())
                .capacidade(t.getCapacidade())
                .unidade(t.getUnidade())
                .localizacao(t.getLocalizacao())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
