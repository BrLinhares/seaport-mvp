package com.seaport.dto.tripulante;

import com.seaport.entity.TipoDocumentoTripulante;
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
public class TripulanteResponseDTO {

    private Long id;
    private Long embarcacaoId;
    private String embarcacaoNome;
    private String nomeCompleto;
    private String numeroCIR;
    private LocalDate dataVencimentoCIR;
    private String categoria;
    private String funcaoBase;
    private LocalDate dataEntradaEmpresa;
    private String documentoUrl;
    private TipoDocumentoTripulante tipoDocumento;
    private boolean ativo;
    private LocalDateTime dataCadastro;
    private LocalDateTime updatedAt;
}
