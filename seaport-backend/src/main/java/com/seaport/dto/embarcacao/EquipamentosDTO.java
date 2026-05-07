package com.seaport.dto.embarcacao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipamentosDTO {

    private String navegacao;
    private String comunicacao;
    private String seguranca;
}
