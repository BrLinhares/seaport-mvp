package com.seaport.dto.tanque;

import com.seaport.entity.LocalizacaoTanque;
import com.seaport.entity.TipoTanque;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO para criação avulsa de tanque via POST /tanques.
 * Inclui o id da embarcação, que não está presente no TanqueDTO inline.
 */
@Data
public class TanqueCreateDTO {

    @NotNull(message = "embarcacaoId é obrigatório")
    private Long embarcacaoId;

    private String nome;

    @NotNull(message = "Tipo do tanque é obrigatório")
    private TipoTanque tipo;

    @NotNull(message = "Capacidade é obrigatória")
    @DecimalMin(value = "0.01", message = "Capacidade deve ser maior que zero")
    private BigDecimal capacidade;

    private String unidade;

    private LocalizacaoTanque localizacao;
}
