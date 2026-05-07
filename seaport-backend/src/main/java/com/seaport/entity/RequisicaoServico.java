package com.seaport.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "requisicao_servico")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RequisicaoServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Ex.: RS-2026-001 — gerado automaticamente pelo service */
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

    @Column(nullable = false, columnDefinition = "TEXT")
    private String servicoSolicitado;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricaoDetalhada;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String localExecucao;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String justificativa;

    @Column(nullable = false)
    private String encaminhadoPara;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

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
