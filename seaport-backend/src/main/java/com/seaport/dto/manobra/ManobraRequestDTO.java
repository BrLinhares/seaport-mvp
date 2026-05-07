package com.seaport.dto.manobra;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ManobraRequestDTO {

    @NotNull(message = "Embarcação é obrigatória")
    private Long embarcacaoId;

    @NotBlank(message = "Local da manobra é obrigatório")
    private String localManobra;

    @NotBlank(message = "Navio ou cliente é obrigatório")
    private String navioOuCliente;

    @NotBlank(message = "Tipo da manobra é obrigatório")
    private String tipoManobra;

    @NotNull(message = "Data/hora de início é obrigatória")
    private LocalDateTime dataHoraInicio;

    @NotNull(message = "Data/hora de fim é obrigatória")
    private LocalDateTime dataHoraFim;

    @NotNull(message = "Consumo de combustível é obrigatório")
    @DecimalMin(value = "0", message = "Consumo não pode ser negativo")
    private BigDecimal consumoCombustivel;

    private String observacoes;
}
