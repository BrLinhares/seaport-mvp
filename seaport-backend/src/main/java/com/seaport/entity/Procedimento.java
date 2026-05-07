package com.seaport.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "procedimentos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Procedimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, unique = true)
    private String codigo;

    private String revisao;

    private LocalDate dataEmissao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParteProcedimento parte;

    @Column(name = "arquivo_pdf", columnDefinition = "TEXT")
    private String arquivoPdf;

    @Builder.Default
    private boolean ativo = true;

    @CreationTimestamp
    private LocalDateTime dataCadastro;

    @OneToMany(mappedBy = "procedimento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ProcedimentoPermissaoRole> permissoes = new ArrayList<>();
}
