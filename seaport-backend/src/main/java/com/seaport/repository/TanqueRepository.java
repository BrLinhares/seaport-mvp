package com.seaport.repository;

import com.seaport.entity.Tanque;
import com.seaport.entity.TipoTanque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TanqueRepository extends JpaRepository<Tanque, Long> {

    List<Tanque> findByEmbarcacaoIdOrderByTipoAscNomeAsc(Long embarcacaoId);

    List<Tanque> findByEmbarcacaoIdAndTipo(Long embarcacaoId, TipoTanque tipo);

    boolean existsByEmbarcacaoIdAndNomeIgnoreCase(Long embarcacaoId, String nome);

    /** Verifica unicidade do nome ao editar, excluindo o próprio registro. */
    boolean existsByEmbarcacaoIdAndNomeIgnoreCaseAndIdNot(Long embarcacaoId, String nome, Long id);

    void deleteByEmbarcacaoId(Long embarcacaoId);
}
