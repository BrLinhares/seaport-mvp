package com.seaport.dto.requisicao;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RequisicaoServicoRequestDTO {

    @NotBlank(message = "Setor é obrigatório")
    private String setor;

    @NotBlank(message = "Nome do solicitante é obrigatório")
    private String solicitanteNome;

    @NotBlank(message = "Cargo do solicitante é obrigatório")
    private String solicitanteCargo;

    private boolean urgencia;

    @NotBlank(message = "Serviço solicitado é obrigatório")
    private String servicoSolicitado;

    @NotBlank(message = "Descrição detalhada é obrigatória")
    private String descricaoDetalhada;

    @NotBlank(message = "Local de execução é obrigatório")
    private String localExecucao;

    @NotBlank(message = "Justificativa é obrigatória")
    private String justificativa;

    @NotBlank(message = "Encaminhado para é obrigatório")
    private String encaminhadoPara;

    private String observacoes;

    /** Embarcação relacionada (opcional) */
    private Long embarcacaoId;
}
