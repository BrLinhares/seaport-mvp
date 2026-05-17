package com.seaport.repository;

import com.seaport.entity.EscalaTripulacao;
import com.seaport.entity.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscalaTripulacaoRepository extends JpaRepository<EscalaTripulacao, Long> {

    // ---- Consultas para dashboard ----

    /** Tripulação ativa a bordo de uma embarcação (turno aberto). */
    List<EscalaTripulacao> findByEmbarcacaoIdAndAtivoTrueAndDataFimIsNullOrderByTurnoAscFuncaoAsc(Long embarcacaoId);

    /** Histórico completo de escala por embarcação. */
    List<EscalaTripulacao> findByEmbarcacaoIdOrderByDataInicioDesc(Long embarcacaoId);

    /** Escalas abertas de um tripulante. */
    List<EscalaTripulacao> findByTripulanteIdAndAtivoTrueAndDataFimIsNull(Long tripulanteId);

    // ---- Validações de unicidade ----

    /**
     * Garante que um tripulante não possua dois turnos ativos iguais
     * (regra global: independente de embarcação).
     */
    boolean existsByTripulanteIdAndTurnoAndAtivoTrueAndDataFimIsNull(
            Long tripulanteId, Turno turno);

    boolean existsByTripulanteIdAndTurnoAndAtivoTrueAndDataFimIsNullAndIdNot(
            Long tripulanteId, Turno turno, Long id);

    /**
     * Garante que uma embarcação não tenha dois Comandantes ativos no mesmo turno.
     */
    @Query("""
        SELECT COUNT(e) > 0 FROM EscalaTripulacao e
        WHERE e.embarcacao.id = :embarcacaoId
          AND LOWER(e.funcao) = LOWER(cast(:funcao as string))
          AND e.turno = :turno
          AND e.ativo = true
          AND e.dataFim IS NULL
        """)
    boolean existsComandanteAtivoNoTurno(
            @Param("embarcacaoId") Long embarcacaoId,
            @Param("funcao") String funcao,
            @Param("turno") Turno turno);

    @Query("""
        SELECT COUNT(e) > 0 FROM EscalaTripulacao e
        WHERE e.embarcacao.id = :embarcacaoId
          AND LOWER(e.funcao) = LOWER(cast(:funcao as string))
          AND e.turno = :turno
          AND e.ativo = true
          AND e.dataFim IS NULL
          AND e.id <> :idIgnorar
        """)
    boolean existsComandanteAtivoNoTurnoExcluindo(
            @Param("embarcacaoId") Long embarcacaoId,
            @Param("funcao") String funcao,
            @Param("turno") Turno turno,
            @Param("idIgnorar") Long idIgnorar);
}
