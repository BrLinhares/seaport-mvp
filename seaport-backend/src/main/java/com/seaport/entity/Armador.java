package com.seaport.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "armadores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Armador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nome;

    private String nacionalidade;
    private String endereco;
    private String cep;
    private String cnpj;

    @OneToOne(mappedBy = "armador")
    private Embarcacao embarcacao;
}
