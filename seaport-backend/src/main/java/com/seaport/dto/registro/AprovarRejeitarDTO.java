package com.seaport.dto.registro;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AprovarRejeitarDTO {

    // Obrigatório apenas na rejeição — validado no service
    private String motivoRejeicao;
}
