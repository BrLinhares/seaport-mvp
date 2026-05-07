package com.seaport.dto.sondagem;

import com.seaport.entity.StatusSondagem;
import com.seaport.entity.TipoTanque;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SondagemResponseDTO {

    private Long id;

    private Long embarcacaoId;
    private String embarcacaoNome;

    private Long tanqueId;
    private String tanqueNome;
    private BigDecimal tanqueCapacidade;
    private String tanqueUnidade;

    private TipoTanque tipo;

    private BigDecimal volumeLitros;

    /** Percentual preenchido: volumeLitros / tanque.capacidade * 100. */
    private Integer percentual;

    private LocalDateTime dataHora;

    private StatusSondagem status;

    private LocalDateTime dataAprovacao;
    private String aprovadoPorNome;
    private String motivoRejeicao;

    private String usuarioNome;
    private LocalDateTime dataCadastro;
}
