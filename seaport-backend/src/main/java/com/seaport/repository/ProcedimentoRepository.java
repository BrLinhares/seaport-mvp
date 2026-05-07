package com.seaport.repository;

import com.seaport.entity.Procedimento;
import com.seaport.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProcedimentoRepository extends JpaRepository<Procedimento, Long> {

    /** Todos os procedimentos ativos — usado por GERENTE e DIRETORIA. */
    List<Procedimento> findByAtivoTrueOrderByParteAscTituloAsc();

    /**
     * Procedimentos ativos que possuem a role informada nas permissões.
     * Usado para filtrar acesso de TRIPULACAO.
     */
    @Query("""
        SELECT DISTINCT p FROM Procedimento p
        JOIN p.permissoes per
        WHERE p.ativo = true AND per.role = :role
        ORDER BY p.parte ASC, p.titulo ASC
        """)
    List<Procedimento> findAtivosByRole(@Param("role") Role role);

    boolean existsByCodigo(String codigo);

    boolean existsByCodigoAndIdNot(String codigo, Long id);
}
