package com.seaport.dto.requisicao;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class RequisicaoServicoResponseDTO {

    private Long id;
    private String numero;
    private LocalDate data;
    private String setor;
    private String solicitanteNome;
    private String solicitanteCargo;
    private boolean urgencia;
    private String servicoSolicitado;
    private String descricaoDetalhada;
    private String localExecucao;
    private String justificativa;
    private String encaminhadoPara;
    private String observacoes;
    private Long embarcacaoId;
    private String embarcacaoNome;
    private String criadoPorNome;
    private LocalDateTime createdAt;
}
