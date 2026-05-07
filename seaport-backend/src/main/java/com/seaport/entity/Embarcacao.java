package com.seaport.entity;

import com.seaport.entity.embeddable.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "embarcacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Embarcacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    private Integer anoConstrucao;
    private String tipoEmbarcacao;
    private String areaNavegacao;
    private String portoRegistro;
    private BigDecimal porteBruto;
    private BigDecimal arqueacaoBruta;
    private BigDecimal arqueacaoLiquida;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    private String imagem;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // --- Embeddables ---

    @Embedded
    private CaracteristicasCasco caracteristicasCasco;

    @Embedded
    private Estrutura estrutura;

    @Embedded
    private Compartimentagem compartimentagem;

    @Embedded
    private Energia energia;

    @Embedded
    private Tripulacao tripulacao;

    @Embedded
    private Equipamentos equipamentos;

    // --- Associações @OneToOne ---

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "armador_id")
    private Armador armador;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "construtor_id")
    private Construtor construtor;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "engenheiro_id")
    private EngenheiroResponsavel engenheiro;

    // --- Associação @OneToMany ---

    @OneToMany(mappedBy = "embarcacao", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Propulsao> propulsoes = new ArrayList<>();

    @OneToMany(mappedBy = "embarcacao", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Tanque> tanques = new ArrayList<>();

    /** Utilitário para manter o relacionamento bidirecional consistente. */
    public void addPropulsao(Propulsao propulsao) {
        propulsoes.add(propulsao);
        propulsao.setEmbarcacao(this);
    }

    public void removePropulsao(Propulsao propulsao) {
        propulsoes.remove(propulsao);
        propulsao.setEmbarcacao(null);
    }

    public void addTanque(Tanque tanque) {
        tanques.add(tanque);
        tanque.setEmbarcacao(this);
    }

    public void removeTanque(Tanque tanque) {
        tanques.remove(tanque);
        tanque.setEmbarcacao(null);
    }
}
