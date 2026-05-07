package com.seaport.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sondagem_tanque")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SondagemTanque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "embarcacao_id", nullable = false)
    private Embarcacao embarcacao;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tanque_id", nullable = false)
    private Tanque tanque;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    /** Tipo do tanque sondado — deve ser compatível com tanque.tipo. */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoTanque tipo;

    /** Volume medido em litros (>= 0 e <= tanque.capacidade). */
    @NotNull
    @DecimalMin("0")
    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal volumeLitros;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime dataHora;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusSondagem status = StatusSondagem.PENDENTE;

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
