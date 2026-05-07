package com.seaport.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean enabled;
    private boolean mustChangePassword;
    private Long embarcacaoId;
    private String embarcacaoNome;
    private LocalDateTime createdAt;
}
