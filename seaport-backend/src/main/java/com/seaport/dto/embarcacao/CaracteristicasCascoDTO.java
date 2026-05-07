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
public class CaracteristicasCascoDTO {

    @Positive(message = "Comprimento total deve ser positivo")
    private BigDecimal comprimentoTotal;

    @Positive(message = "Comprimento entre perpendiculares deve ser positivo")
    private BigDecimal comprimentoEntrePerpendiculares;

    @Positive(message = "Boca deve ser positiva")
    private BigDecimal boca;

    @Positive(message = "Pontal deve ser positivo")
    private BigDecimal pontal;

    @Positive(message = "Calado deve ser positivo")
    private BigDecimal calado;

    @Positive(message = "Deslocamento leve deve ser positivo")
    private BigDecimal deslocamentoLeve;

    @Positive(message = "Deslocamento carregado deve ser positivo")
    private BigDecimal deslocamentoCarregado;
}
