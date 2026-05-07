package com.seaport.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "propulsoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Propulsao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;
    private String marca;
    private String potencia;
    private Integer quantidade;
    private BigDecimal rpm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "embarcacao_id")
    private Embarcacao embarcacao;
}
