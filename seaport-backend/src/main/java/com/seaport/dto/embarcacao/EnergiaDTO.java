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
public class EnergiaDTO {

    private String tipoMotor;
    private String potenciaGerador;

    @Positive(message = "Quantidade de geradores deve ser positiva")
    private Integer quantidadeGeradores;
}
