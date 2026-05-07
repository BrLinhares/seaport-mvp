package com.seaport.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "item_requisicao_material")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ItemRequisicaoMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisicao_id", nullable = false)
    private RequisicaoMaterial requisicao;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricaoMaterial;

    @Column(nullable = false)
    private String quantidade;

    @Column(columnDefinition = "TEXT")
    private String especificacaoTecnica;

    @Column(columnDefinition = "TEXT")
    private String justificativa;

    private Integer ordem;
}
