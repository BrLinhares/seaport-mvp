package com.seaport.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Senha temporária é obrigatória")
    @Size(min = 8, message = "Mínimo 8 caracteres")
    private String password;

    @NotNull(message = "Perfil é obrigatório")
    private String role;

    // Nullable — só usado quando role = ROLE_TRIPULACAO
    private Long embarcacaoId;
}
