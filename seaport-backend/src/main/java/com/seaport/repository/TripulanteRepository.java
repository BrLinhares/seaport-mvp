package com.seaport.repository;

import com.seaport.entity.Tripulante;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripulanteRepository extends JpaRepository<Tripulante, Long> {

    List<Tripulante> findByEmbarcacaoIdOrderByNomeCompletoAsc(Long embarcacaoId);

    List<Tripulante> findByEmbarcacaoIdAndAtivoOrderByNomeCompletoAsc(Long embarcacaoId, boolean ativo);

    Optional<Tripulante> findByNumeroCIR(String numeroCIR);

    boolean existsByNumeroCIR(String numeroCIR);

    boolean existsByNumeroCIRAndIdNot(String numeroCIR, Long id);

    @Query("""
        SELECT t FROM Tripulante t
        WHERE (:embarcacaoId IS NULL OR t.embarcacao.id = :embarcacaoId)
          AND (:ativo IS NULL OR t.ativo = :ativo)
          AND (cast(:nome as string) IS NULL OR LOWER(t.nomeCompleto) LIKE LOWER(CONCAT('%', cast(:nome as string), '%')))
        ORDER BY t.nomeCompleto
        """)
    Page<Tripulante> buscarComFiltros(
            @Param("embarcacaoId") Long embarcacaoId,
            @Param("ativo") Boolean ativo,
            @Param("nome") String nome,
            Pageable pageable);
}
