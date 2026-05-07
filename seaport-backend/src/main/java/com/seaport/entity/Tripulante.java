package com.seaport.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tripulantes", indexes = {
        @Index(name = "idx_tripulante_embarcacao", columnList = "embarcacao_id"),
        @Index(name = "idx_tripulante_cir", columnList = "numero_cir")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tripulante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Embarcação principal do tripulante. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "embarcacao_id")
    private Embarcacao embarcacao;

    @NotBlank
    @Column(nullable = false)
    private String nomeCompleto;

    /** Caderneta de Inscrição e Registro — único por tripulante. */
    @Column(name = "numero_cir", unique = true)
    private String numeroCIR;

    /** Categoria de habilitação (ex: Moço de Convés, Marinheiro, Mestre…). */
    private String categoria;

    /** Função base no cadastro (diferente da função por escala). */
    private String funcaoBase;

    private LocalDate dataEntradaEmpresa;

    /** Data de vencimento da CIR. */
    private LocalDate dataVencimentoCIR;

    /** Caminho/URL do documento CIR armazenado. */
    @Column(columnDefinition = "TEXT")
    private String documentoUrl;

    @Enumerated(EnumType.STRING)
    private TipoDocumentoTripulante tipoDocumento;

    @Builder.Default
    @Column(nullable = false)
    private boolean ativo = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime dataCadastro;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
