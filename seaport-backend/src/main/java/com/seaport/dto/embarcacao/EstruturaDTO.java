package com.seaport.dto.embarcacao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstruturaDTO {

    private String materialCasco;
    private String materialConves;
    private String materialAnteparas;
    private String materialSuperestrutura;
    private String tipoEstrutura;
}
