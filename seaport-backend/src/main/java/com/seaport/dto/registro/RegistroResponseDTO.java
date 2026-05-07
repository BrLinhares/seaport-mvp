package com.seaport.dto.registro;

import com.seaport.entity.StatusRegistro;
import com.seaport.entity.TipoRegistro;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RegistroResponseDTO {

    private Long id;
    private Long embarcacaoId;
    private String embarcacaoNome;
    private Long criadorId;
    private String criadorNome;
    private TipoRegistro tipo;
    private String descricao;
    private LocalDateTime dataRegistro;
    private StatusRegistro status;
    private LocalDateTime dataAprovacao;
    private String aprovadoPorNome;
    private String motivoRejeicao;
    private Integer nivelCombustivel;
    private Integer nivelAgua;
    private LocalDateTime createdAt;
}
