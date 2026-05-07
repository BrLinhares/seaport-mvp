package com.seaport.dto.requisicao;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RequisicaoMaterialResponseDTO {

    private Long id;
    private String numero;
    private LocalDate data;
    private String setor;
    private String solicitanteNome;
    private String solicitanteCargo;
    private boolean urgencia;
    private String encaminhadoPara;
    private String observacoes;
    private List<ItemResponseDTO> itens;
    private Long embarcacaoId;
    private String embarcacaoNome;
    private String criadoPorNome;
    private LocalDateTime createdAt;

    @Data @Builder
    public static class ItemResponseDTO {
        private Long id;
        private String descricaoMaterial;
        private String quantidade;
        private String especificacaoTecnica;
        private String justificativa;
        private Integer ordem;
    }
}
