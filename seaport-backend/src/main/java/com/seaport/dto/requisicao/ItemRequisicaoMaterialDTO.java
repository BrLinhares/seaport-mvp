package com.seaport.dto.requisicao;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ItemRequisicaoMaterialDTO {

    @NotBlank(message = "Descrição do material é obrigatória")
    private String descricaoMaterial;

    @NotBlank(message = "Quantidade é obrigatória")
    private String quantidade;

    private String especificacaoTecnica;
    private String justificativa;
}
