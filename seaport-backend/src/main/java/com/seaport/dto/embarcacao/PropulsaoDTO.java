package com.seaport.dto.embarcacao;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropulsaoDTO {

    private Long id;
    private String tipo;
    private String marca;
    private String potencia;

    @Positive(message = "Quantidade deve ser positiva")
    private Integer quantidade;

    @Positive(message = "RPM deve ser positivo")
    private BigDecimal rpm;
}
