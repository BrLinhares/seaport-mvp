package com.seaport.entity.embeddable;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class CaracteristicasCasco {

    private BigDecimal comprimentoTotal;
    private BigDecimal comprimentoEntrePerpendiculares;
    private BigDecimal boca;
    private BigDecimal pontal;
    private BigDecimal calado;
    private BigDecimal deslocamentoLeve;
    private BigDecimal deslocamentoCarregado;
}
