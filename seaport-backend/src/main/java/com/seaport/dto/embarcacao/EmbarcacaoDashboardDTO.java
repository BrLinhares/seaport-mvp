package com.seaport.dto.embarcacao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmbarcacaoDashboardDTO {

    private Long id;
    private String nome;
    private String imagem;
    private String tipo;
    private Integer combustivel;
    private Integer agua;
    private List<RegistroSummaryDTO> manobras;
    private List<RegistroSummaryDTO> manutencoes;

    /** Manobras realizadas aprovadas (entidade Manobra). */
    private List<ManobrasummaryDTO> manobrasList;

    /** Tripulação ativa a bordo, derivada da escala. */
    private List<MembroEscalaDTO> tripulacao;

    /** Comandantes ativos, agrupados por turno. */
    private List<ComandanteDTO> comandantes;

    // -----------------------------------------------------------------------
    // Inner DTOs
    // -----------------------------------------------------------------------

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegistroSummaryDTO {
        private Long id;
        private String descricao;
        private LocalDateTime dataRegistro;
        private LocalDateTime dataAprovacao;
        private String aprovadoPor;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MembroEscalaDTO {
        private Long tripulanteId;
        private String nome;
        private String numeroCIR;
        private String funcao;
        private String turno;
        private String turnoDescricao;
        private LocalDate dataInicio;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManobrasummaryDTO {
        private Long id;
        private String tipoManobra;
        private String localManobra;
        private String navioOuCliente;
        private LocalDateTime dataHoraInicio;
        private LocalDateTime dataHoraFim;
        private BigDecimal consumoCombustivel;
        private String aprovadoPor;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComandanteDTO {
        private Long tripulanteId;
        private String nome;
        private String turno;
        private String turnoDescricao;
        private LocalDate dataInicio;
    }
}
