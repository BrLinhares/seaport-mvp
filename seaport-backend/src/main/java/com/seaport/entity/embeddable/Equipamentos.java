package com.seaport.entity.embeddable;

import jakarta.persistence.Column;
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
public class Equipamentos {

    @Column(length = 1000)
    private String navegacao;

    @Column(length = 1000)
    private String comunicacao;

    @Column(length = 1000)
    private String seguranca;
}
