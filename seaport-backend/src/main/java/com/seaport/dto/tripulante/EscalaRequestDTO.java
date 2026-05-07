package com.seaport.dto.tripulante;

import com.seaport.entity.Turno;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EscalaRequestDTO {

    @NotNull(message = "tripulanteId é obrigatório")
    private Long tripulanteId;

    @NotNull(message = "embarcacaoId é obrigatório")
    private Long embarcacaoId;

    @NotBlank(message = "Função é obrigatória")
    private String funcao;

    @NotNull(message = "Turno é obrigatório")
    private Turno turno;

    @NotNull(message = "Data de início é obrigatória")
    private LocalDate dataInicio;

    private LocalDate dataFim;
}
