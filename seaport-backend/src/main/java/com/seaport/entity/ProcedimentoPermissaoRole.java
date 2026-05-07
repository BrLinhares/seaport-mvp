package com.seaport.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "procedimento_permissao_role",
    uniqueConstraints = @UniqueConstraint(columnNames = {"procedimento_id", "role"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcedimentoPermissaoRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedimento_id", nullable = false)
    private Procedimento procedimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}
