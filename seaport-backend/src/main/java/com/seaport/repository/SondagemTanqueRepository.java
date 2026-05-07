package com.seaport.repository;

import com.seaport.entity.SondagemTanque;
import com.seaport.entity.StatusSondagem;
import com.seaport.entity.TipoTanque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SondagemTanqueRepository extends JpaRepository<SondagemTanque, Long> {

    /** Todas as sondagens de uma embarcação, mais recentes primeiro. */
    List<SondagemTanque> findByEmbarcacaoIdOrderByDataHoraDesc(Long embarcacaoId);

    /** Todas as sondagens do sistema. */
    List<SondagemTanque> findAllByOrderByDataHoraDesc();

    /** Sondagens filtradas por status. */
    List<SondagemTanque> findByStatusOrderByDataHoraDesc(StatusSondagem status);

    /**
     * Última sondagem aprovada por embarcação e tipo.
     * Usada pelo dashboard para alimentar o TankLevel.
     */
    Optional<SondagemTanque> findFirstByEmbarcacaoIdAndTipoAndStatusOrderByDataHoraDesc(
            Long embarcacaoId, TipoTanque tipo, StatusSondagem status);
}
