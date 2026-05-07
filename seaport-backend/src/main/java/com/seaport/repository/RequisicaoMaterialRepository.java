package com.seaport.repository;

import com.seaport.entity.RequisicaoMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequisicaoMaterialRepository extends JpaRepository<RequisicaoMaterial, Long> {

    List<RequisicaoMaterial> findAllByOrderByCreatedAtDesc();

    long countByNumeroStartingWith(String prefix);
}
