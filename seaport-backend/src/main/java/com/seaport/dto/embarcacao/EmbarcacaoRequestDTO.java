package com.seaport.dto.embarcacao;

import com.seaport.dto.tanque.TanqueDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmbarcacaoRequestDTO {

    @NotBlank(message = "Nome da embarcação é obrigatório")
    private String nome;

    private String imagem;

    private Integer anoConstrucao;
    private String tipoEmbarcacao;
    private String areaNavegacao;
    private String portoRegistro;

    @Positive(message = "Porte bruto deve ser positivo")
    private BigDecimal porteBruto;

    @Positive(message = "Arqueação bruta deve ser positiva")
    private BigDecimal arqueacaoBruta;

    @Positive(message = "Arqueação líquida deve ser positiva")
    private BigDecimal arqueacaoLiquida;

    private String observacoes;

    @Valid
    private ArmadorDTO armador;

    @Valid
    private ConstrutorDTO construtor;

    @Valid
    private EngenheiroDTO engenheiro;

    @Valid
    private CaracteristicasCascoDTO caracteristicasCasco;

    @Valid
    private EstruturaDTO estrutura;

    @Valid
    private CompartimentagemDTO compartimentagem;

    @Valid
    private List<PropulsaoDTO> propulsoes;

    @Valid
    private EnergiaDTO energia;

    @Valid
    private TripulacaoDTO tripulacao;

    @Valid
    private EquipamentosDTO equipamentos;

    @Valid
    private List<TanqueDTO> tanques;
}
