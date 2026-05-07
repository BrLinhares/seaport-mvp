package com.seaport.dto.manobra;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejeicaoManobraRequestDTO {

    @NotBlank(message = "O motivo da rejeição é obrigatório")
    private String motivo;
}
