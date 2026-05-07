package com.seaport.dto.embarcacao;

import com.seaport.dto.tanque.TanqueResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmbarcacaoResponseDTO {

    private Long id;
    private String nome;
    private String imagem;
    private Integer anoConstrucao;
    private String tipoEmbarcacao;
    private String areaNavegacao;
    private String portoRegistro;
    private BigDecimal porteBruto;
    private BigDecimal arqueacaoBruta;
    private BigDecimal arqueacaoLiquida;
    private String observacoes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private ArmadorDTO armador;
    private ConstrutorDTO construtor;
    private EngenheiroDTO engenheiro;
    private CaracteristicasCascoDTO caracteristicasCasco;
    private EstruturaDTO estrutura;
    private CompartimentagemDTO compartimentagem;
    private List<PropulsaoDTO> propulsoes;
    private EnergiaDTO energia;
    private TripulacaoDTO tripulacao;
    private EquipamentosDTO equipamentos;
    private List<TanqueResponseDTO> tanques;
}
