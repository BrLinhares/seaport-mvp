package com.seaport.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "escala_tripulacao", indexes = {
        @Index(name = "idx_escala_tripulante", columnList = "tripulante_id"),
        @Index(name = "idx_escala_embarcacao", columnList = "embarcacao_id"),
        @Index(name = "idx_escala_ativo", columnList = "ativo")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EscalaTripulacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tripulante_id", nullable = false)
    private Tripulante tripulante;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "embarcacao_id", nullable = false)
    private Embarcacao embarcacao;

    /** Função operacional neste turno: Comandante, Imediato, Marinheiro… */
    @NotBlank
    @Column(nullable = false)
    private String funcao;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Turno turno;

    @NotNull
    @Column(nullable = false)
    private LocalDate dataInicio;

    /** Nulo enquanto o turno está em vigor. Preenchido ao encerrar. */
    private LocalDate dataFim;

    @Builder.Default
    @Column(nullable = false)
    private boolean ativo = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
