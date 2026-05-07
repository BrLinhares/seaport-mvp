package com.seaport.repository;

import com.seaport.dto.embarcacao.EmbarcacaoSummaryDTO;
import com.seaport.entity.Embarcacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmbarcacaoRepository extends JpaRepository<Embarcacao, Long> {

    /**
     * Projeção leve para listagem — retorna apenas os campos do {@link EmbarcacaoSummaryDTO}.
     * O Spring Data cria a implementação em tempo de execução via interface projection.
     */
    List<EmbarcacaoSummaryProjection> findAllProjectedBy();

    Page<Embarcacao> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    boolean existsByNomeIgnoreCase(String nome);

    // --- Interface de projeção interna ---

    interface EmbarcacaoSummaryProjection {
        Long getId();
        String getNome();
        String getImagem();
        String getTipoEmbarcacao();
        String getAreaNavegacao();
        String getPortoRegistro();
        Integer getAnoConstrucao();
        java.time.LocalDateTime getCreatedAt();
    }
}
