package com.seaport.repository;

import com.seaport.entity.RegistroOperacional;
import com.seaport.entity.StatusRegistro;
import com.seaport.entity.TipoRegistro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroOperacionalRepository extends JpaRepository<RegistroOperacional, Long> {

    // Gerente: todos os registros, paginado, filtro por status opcional
    Page<RegistroOperacional> findByStatusOrderByCreatedAtDesc(StatusRegistro status, Pageable pageable);

    Page<RegistroOperacional> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Diretoria: apenas aprovados
    List<RegistroOperacional> findByStatusOrderByDataAprovacaoDesc(StatusRegistro status);

    // Tripulação: apenas da sua embarcação
    @Query("SELECT r FROM RegistroOperacional r WHERE r.embarcacao.id = :embarcacaoId ORDER BY r.createdAt DESC")
    List<RegistroOperacional> findByEmbarcacaoId(@Param("embarcacaoId") Long embarcacaoId);

    // Contagens para dashboards
    long countByStatus(StatusRegistro status);

    @Query("SELECT COUNT(r) FROM RegistroOperacional r WHERE r.embarcacao.id = :embarcacaoId AND r.status = :status")
    long countByEmbarcacaoIdAndStatus(@Param("embarcacaoId") Long embarcacaoId, @Param("status") StatusRegistro status);

    // Dashboard da embarcação — registros aprovados filtrados por tipo
    @Query("SELECT r FROM RegistroOperacional r WHERE r.embarcacao.id = :embarcacaoId AND r.tipo = :tipo AND r.status = :status ORDER BY r.dataAprovacao DESC")
    List<RegistroOperacional> findByEmbarcacaoIdAndTipoAndStatus(
            @Param("embarcacaoId") Long embarcacaoId,
            @Param("tipo") TipoRegistro tipo,
            @Param("status") StatusRegistro status,
            Pageable pageable);
}
