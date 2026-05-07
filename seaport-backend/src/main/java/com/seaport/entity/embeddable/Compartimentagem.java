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
public class Compartimentagem {

    private String localSuperestrutura;
    private String localPracaMaquinas;
    private Integer numeroAnteparasTransversais;
    private Integer numeroConveses;
    private Integer numeroCasarias;
}
