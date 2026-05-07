package com.seaport.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "manobra")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Manobra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "embarcacao_id", nullable = false)
    private Embarcacao embarcacao;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    @Column(nullable = false)
    private String localManobra;

    @Column(nullable = false)
    private String navioOuCliente;

    @Column(nullable = false)
    private String tipoManobra;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime dataHoraInicio;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime dataHoraFim;

    @NotNull
    @DecimalMin("0")
    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal consumoCombustivel;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusManobra status = StatusManobra.PENDENTE;

    private LocalDateTime dataAprovacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprovado_por_id")
    private User aprovadoPor;

    @Column(columnDefinition = "TEXT")
    private String motivoRejeicao;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime dataCadastro;
}
