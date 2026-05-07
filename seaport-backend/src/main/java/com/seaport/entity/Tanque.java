package com.seaport.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "tanques",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_tanque_nome_embarcacao",
        columnNames = {"embarcacao_id", "nome"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tanque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "embarcacao_id", nullable = false)
    private Embarcacao embarcacao;

    private String nome;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoTanque tipo;

    @NotNull
    @DecimalMin(value = "0.01", message = "Capacidade deve ser maior que zero")
    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal capacidade;

    /** Unidade de medida: L, m³, t… */
    @Column(length = 20)
    private String unidade;

    @Enumerated(EnumType.STRING)
    private LocalizacaoTanque localizacao;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
