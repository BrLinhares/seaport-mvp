package com.seaport.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "requisicao_material")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RequisicaoMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Ex.: RM-2026-001 — gerado automaticamente pelo service */
    @Column(nullable = false, unique = true, length = 20)
    private String numero;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private String setor;

    @Column(nullable = false)
    private String solicitanteNome;

    @Column(nullable = false)
    private String solicitanteCargo;

    private boolean urgencia;

    /** "Victor da Ponte – Diretor" */
    @Column(nullable = false)
    private String encaminhadoPara;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @OneToMany(mappedBy = "requisicao", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("ordem ASC")
    @Builder.Default
    private List<ItemRequisicaoMaterial> itens = new ArrayList<>();

    /** Embarcação relacionada à requisição (opcional) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "embarcacao_id")
    private Embarcacao embarcacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criado_por_id", nullable = false)
    private User criadoPor;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
