package com.seaport.dto.sondagem;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejeicaoRequestDTO {

    @NotBlank(message = "O motivo da rejeição é obrigatório")
    private String motivo;
}
