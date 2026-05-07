package com.seaport.repository;

import com.seaport.entity.Manobra;
import com.seaport.entity.StatusManobra;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManobraRepository extends JpaRepository<Manobra, Long> {

    List<Manobra> findByEmbarcacaoIdOrderByDataHoraInicioDesc(Long embarcacaoId);

    List<Manobra> findAllByOrderByDataHoraInicioDesc();

    List<Manobra> findByStatusOrderByDataHoraInicioDesc(StatusManobra status);

    List<Manobra> findByEmbarcacaoIdAndStatusOrderByDataHoraInicioDesc(
            Long embarcacaoId, StatusManobra status, Pageable pageable);
}
