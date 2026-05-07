package com.seaport.dto.procedimento;

import com.seaport.entity.ParteProcedimento;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProcedimentoResponseDTO {

    private Long id;
    private String titulo;
    private String codigo;
    private String revisao;
    private LocalDate dataEmissao;
    private ParteProcedimento parte;
    private String parteDescricao;
    private boolean ativo;

    /** Indica se há um arquivo PDF associado (sem expor o path interno). */
    private boolean temArquivo;

    private LocalDateTime dataCadastro;

    /** Roles com permissão para visualizar este procedimento. */
    private List<String> rolesPermitidas;
}
