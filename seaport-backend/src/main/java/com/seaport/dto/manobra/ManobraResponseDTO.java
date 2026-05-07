package com.seaport.dto.manobra;

import com.seaport.entity.StatusManobra;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ManobraResponseDTO {

    private Long id;

    private Long embarcacaoId;
    private String embarcacaoNome;
    private String usuarioNome;

    private String localManobra;
    private String navioOuCliente;
    private String tipoManobra;

    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataHoraFim;

    private BigDecimal consumoCombustivel;
    private String observacoes;

    private StatusManobra status;
    private LocalDateTime dataAprovacao;
    private String aprovadoPorNome;
    private String motivoRejeicao;

    private LocalDateTime dataCadastro;
}
