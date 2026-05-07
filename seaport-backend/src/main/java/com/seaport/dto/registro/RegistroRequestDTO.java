package com.seaport.dto.registro;

import com.seaport.entity.TipoRegistro;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RegistroRequestDTO {

    @NotNull(message = "Tipo é obrigatório")
    private TipoRegistro tipo;

    @NotBlank(message = "Descrição é obrigatória")
    private String descricao;

    @NotNull(message = "Data do registro é obrigatória")
    private LocalDateTime dataRegistro;

    private Integer nivelCombustivel;
    private Integer nivelAgua;
}
