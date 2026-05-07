package com.seaport.dto.embarcacao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EngenheiroDTO {

    private Long id;
    private String nome;
    private String nacionalidade;
    private String crea;
}
