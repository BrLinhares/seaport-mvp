package com.seaport.dto.sondagem;

import com.seaport.entity.TipoTanque;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SondagemRequestDTO {

    @NotNull(message = "Embarcação é obrigatória")
    private Long embarcacaoId;

    @NotNull(message = "Tanque é obrigatório")
    private Long tanqueId;

    @NotNull(message = "Tipo é obrigatório")
    private TipoTanque tipo;

    @NotNull(message = "Volume é obrigatório")
    @DecimalMin(value = "0", message = "Volume não pode ser negativo")
    private BigDecimal volumeLitros;

    @NotNull(message = "Data/hora é obrigatória")
    private LocalDateTime dataHora;
}
