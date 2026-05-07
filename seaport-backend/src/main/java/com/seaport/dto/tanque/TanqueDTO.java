package com.seaport.dto.tanque;

import com.seaport.entity.LocalizacaoTanque;
import com.seaport.entity.TipoTanque;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO de dados de um tanque — usado inline no cadastro de embarcação
 * e como base para as operações individuais.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TanqueDTO {

    /** Preenchido apenas em respostas (update). */
    private Long id;

    private String nome;

    @NotNull(message = "Tipo do tanque é obrigatório")
    private TipoTanque tipo;

    @NotNull(message = "Capacidade é obrigatória")
    @DecimalMin(value = "0.01", message = "Capacidade deve ser maior que zero")
    private BigDecimal capacidade;

    private String unidade;

    private LocalizacaoTanque localizacao;
}
