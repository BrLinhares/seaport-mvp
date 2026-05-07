package com.seaport.dto.procedimento;

import com.seaport.entity.ParteProcedimento;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProcedimentoRequestDTO {

    private String titulo;
    private String codigo;
    private String revisao;
    private LocalDate dataEmissao;
    private ParteProcedimento parte;

    /** Roles que podem visualizar o procedimento (ex: ["ROLE_TRIPULACAO", "ROLE_GERENTE"]). */
    private List<String> rolesPermitidas;
}
