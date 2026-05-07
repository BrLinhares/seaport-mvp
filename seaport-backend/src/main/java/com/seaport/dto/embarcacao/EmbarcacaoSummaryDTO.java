package com.seaport.dto.embarcacao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmbarcacaoSummaryDTO {

    private Long id;
    private String nome;
    private String imagem;
    private String tipoEmbarcacao;
    private String areaNavegacao;
    private String portoRegistro;
    private Integer anoConstrucao;
    private LocalDateTime createdAt;
}
