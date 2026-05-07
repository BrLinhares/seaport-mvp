package com.seaport.repository;

import com.seaport.entity.Propulsao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PropulsaoRepository extends JpaRepository<Propulsao, Long> {

    void deleteByEmbarcacaoId(Long embarcacaoId);
}
