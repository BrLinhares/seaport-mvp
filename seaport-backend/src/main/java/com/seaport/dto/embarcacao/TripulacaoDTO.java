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
public class TripulacaoDTO {

    @Positive(message = "Quantidade de tripulantes deve ser positiva")
    private Integer quantidadeTripulantes;

    @Positive(message = "Quantidade de passageiros deve ser positiva")
    private Integer quantidadePassageiros;
}
