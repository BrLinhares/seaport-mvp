package com.seaport.dto.tripulante;

import com.seaport.entity.Turno;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalaResponseDTO {

    private Long id;
    private Long tripulanteId;
    private String tripulanteNome;
    private String tripulanteCIR;
    private Long embarcacaoId;
    private String embarcacaoNome;
    private String funcao;
    private Turno turno;
    private String turnoDescricao;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private boolean ativo;
    private LocalDateTime createdAt;
}
