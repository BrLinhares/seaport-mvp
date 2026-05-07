package com.seaport.entity.embeddable;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class Estrutura {

    private String materialCasco;
    private String materialConves;
    private String materialAnteparas;
    private String materialSuperestrutura;
    private String tipoEstrutura;
}
