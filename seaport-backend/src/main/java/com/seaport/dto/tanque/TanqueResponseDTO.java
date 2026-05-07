package com.seaport.dto.tanque;

import com.seaport.entity.LocalizacaoTanque;
import com.seaport.entity.TipoTanque;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TanqueResponseDTO {

    private Long id;
    private Long embarcacaoId;
    private String embarcacaoNome;
    private String nome;
    private TipoTanque tipo;
    private BigDecimal capacidade;
    private String unidade;
    private LocalizacaoTanque localizacao;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
