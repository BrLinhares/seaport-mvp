package com.seaport.dto.tripulante;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TripulanteRequestDTO {

    private Long embarcacaoId;

    @NotBlank(message = "Nome completo é obrigatório")
    private String nomeCompleto;

    private String numeroCIR;
    private LocalDate dataVencimentoCIR;
    private String categoria;
    private String funcaoBase;
    private LocalDate dataEntradaEmpresa;
}
