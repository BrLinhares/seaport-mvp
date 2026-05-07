package com.seaport.dto.embarcacao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArmadorDTO {

    private Long id;

    @NotBlank(message = "Nome do armador é obrigatório")
    private String nome;

    private String nacionalidade;
    private String endereco;
    private String cep;

    @Pattern(
        regexp = "^(\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}|\\d{14})?$",
        message = "CNPJ inválido"
    )
    private String cnpj;
}
