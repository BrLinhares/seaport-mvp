package com.seaport.repository;

import com.seaport.entity.RequisicaoServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequisicaoServicoRepository extends JpaRepository<RequisicaoServico, Long> {

    List<RequisicaoServico> findAllByOrderByCreatedAtDesc();

    long countByNumeroStartingWith(String prefix);
}
