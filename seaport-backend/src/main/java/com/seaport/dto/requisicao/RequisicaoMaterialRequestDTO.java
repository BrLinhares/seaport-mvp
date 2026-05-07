package com.seaport.dto.requisicao;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class RequisicaoMaterialRequestDTO {

    @NotBlank(message = "Setor é obrigatório")
    private String setor;

    @NotBlank(message = "Nome do solicitante é obrigatório")
    private String solicitanteNome;

    @NotBlank(message = "Cargo do solicitante é obrigatório")
    private String solicitanteCargo;

    private boolean urgencia;

    @NotBlank(message = "Encaminhado para é obrigatório")
    private String encaminhadoPara;

    private String observacoes;

    /** Embarcação relacionada (opcional) */
    private Long embarcacaoId;

    @Valid
    @NotEmpty(message = "Adicione ao menos um item")
    private List<ItemRequisicaoMaterialDTO> itens;
}
