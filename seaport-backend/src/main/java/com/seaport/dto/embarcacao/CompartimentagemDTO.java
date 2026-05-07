package com.seaport.dto.embarcacao;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompartimentagemDTO {

    private String localSuperestrutura;
    private String localPracaMaquinas;

    @Positive(message = "Número de anteparas transversais deve ser positivo")
    private Integer numeroAnteparasTransversais;

    @Positive(message = "Número de conveses deve ser positivo")
    private Integer numeroConveses;

    @Positive(message = "Número de casarias deve ser positivo")
    private Integer numeroCasarias;
}
