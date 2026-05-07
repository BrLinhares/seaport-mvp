package com.seaport.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "engenheiros_responsaveis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EngenheiroResponsavel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String nacionalidade;
    private String crea;
}
