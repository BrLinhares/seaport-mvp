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
public class Energia {

    private String tipoMotor;
    private String potenciaGerador;
    private Integer quantidadeGeradores;
}
