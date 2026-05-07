package com.seaport.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.seaport.dto.requisicao.*;
import com.seaport.entity.*;
import com.seaport.repository.*;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class RequisicaoService {

    private final RequisicaoMaterialRepository rmRepo;
    private final RequisicaoServicoRepository rsRepo;
    private final UserRepository userRepository;
    private final EmbarcacaoRepository embarcacaoRepository;

    @Value("${app.pdf.logo-path:../seaport-frontend/public/logo-seaport.png}")
    private String logoPath;

    private String logoDataUri = null;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ── Inicialização: carrega logo como base64 ──────────────────────────────
    @PostConstruct
    public void init() {
        try {
            Path p = Paths.get(logoPath);
            if (Files.exists(p)) {
                byte[] bytes = Files.readAllBytes(p);
                logoDataUri = "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes);
                log.info("Logo PDF carregada: {}", p.toAbsolutePath());
            } else {
                log.warn("Logo PDF não encontrada em: {}. PDF gerado sem logo.", p.toAbsolutePath());
            }
        } catch (Exception e) {
            log.warn("Erro ao carregar logo PDF: {}", e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // REQUISIÇÃO DE MATERIAL
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('GERENTE')")
    public List<RequisicaoMaterialResponseDTO> listarMateriais() {
        return rmRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toRMDto).toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('GERENTE')")
    public RequisicaoMaterialResponseDTO buscarMaterial(Long id) {
        return toRMDto(findRM(id));
    }

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public RequisicaoMaterialResponseDTO criarMaterial(RequisicaoMaterialRequestDTO dto,
                                                        Authentication auth) {
        User user = findUser(auth.getName());

        RequisicaoMaterial rm = RequisicaoMaterial.builder()
                .numero(gerarNumeroRM())
                .data(LocalDate.now())
                .setor(dto.getSetor())
                .solicitanteNome(dto.getSolicitanteNome())
                .solicitanteCargo(dto.getSolicitanteCargo())
                .urgencia(dto.isUrgencia())
                .encaminhadoPara(dto.getEncaminhadoPara())
                .observacoes(dto.getObservacoes())
                .criadoPor(user)
                .build();

        if (dto.getEmbarcacaoId() != null) {
            rm.setEmbarcacao(embarcacaoRepository.findById(dto.getEmbarcacaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Embarcação não encontrada")));
        }

        AtomicInteger ordem = new AtomicInteger(1);
        dto.getItens().forEach(itemDto -> {
            ItemRequisicaoMaterial item = ItemRequisicaoMaterial.builder()
                    .requisicao(rm)
                    .descricaoMaterial(itemDto.getDescricaoMaterial())
                    .quantidade(itemDto.getQuantidade())
                    .especificacaoTecnica(itemDto.getEspecificacaoTecnica())
                    .justificativa(itemDto.getJustificativa())
                    .ordem(ordem.getAndIncrement())
                    .build();
            rm.getItens().add(item);
        });

        return toRMDto(rmRepo.save(rm));
    }

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public void deletarMaterial(Long id) {
        rmRepo.delete(findRM(id));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('GERENTE')")
    public byte[] gerarPdfMaterial(Long id) {
        return renderPdf(buildHtmlRM(findRM(id)));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // REQUISIÇÃO DE SERVIÇO
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('GERENTE')")
    public List<RequisicaoServicoResponseDTO> listarServicos() {
        return rsRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toRSDto).toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('GERENTE')")
    public RequisicaoServicoResponseDTO buscarServico(Long id) {
        return toRSDto(findRS(id));
    }

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public RequisicaoServicoResponseDTO criarServico(RequisicaoServicoRequestDTO dto,
                                                      Authentication auth) {
        User user = findUser(auth.getName());

        RequisicaoServico rs = RequisicaoServico.builder()
                .numero(gerarNumeroRS())
                .data(LocalDate.now())
                .setor(dto.getSetor())
                .solicitanteNome(dto.getSolicitanteNome())
                .solicitanteCargo(dto.getSolicitanteCargo())
                .urgencia(dto.isUrgencia())
                .servicoSolicitado(dto.getServicoSolicitado())
                .descricaoDetalhada(dto.getDescricaoDetalhada())
                .localExecucao(dto.getLocalExecucao())
                .justificativa(dto.getJustificativa())
                .encaminhadoPara(dto.getEncaminhadoPara())
                .observacoes(dto.getObservacoes())
                .criadoPor(user)
                .build();

        if (dto.getEmbarcacaoId() != null) {
            rs.setEmbarcacao(embarcacaoRepository.findById(dto.getEmbarcacaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Embarcação não encontrada")));
        }

        return toRSDto(rsRepo.save(rs));
    }

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public void deletarServico(Long id) {
        rsRepo.delete(findRS(id));
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('GERENTE')")
    public byte[] gerarPdfServico(Long id) {
        return renderPdf(buildHtmlRS(findRS(id)));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HELPERS PRIVADOS
    // ══════════════════════════════════════════════════════════════════════════

    private RequisicaoMaterial findRM(Long id) {
        return rmRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Requisição de Material não encontrada: " + id));
    }

    private RequisicaoServico findRS(Long id) {
        return rsRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Requisição de Serviço não encontrada: " + id));
    }

    private User findUser(String email) {
        return userRepository.findByEmailFetchEmbarcacao(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }

    private synchronized String gerarNumeroRM() {
        int year = LocalDate.now().getYear();
        long count = rmRepo.countByNumeroStartingWith("RM-" + year + "-");
        return String.format("RM-%d-%03d", year, count + 1);
    }

    private synchronized String gerarNumeroRS() {
        int year = LocalDate.now().getYear();
        long count = rsRepo.countByNumeroStartingWith("RS-" + year + "-");
        return String.format("RS-%d-%03d", year, count + 1);
    }

    private RequisicaoMaterialResponseDTO toRMDto(RequisicaoMaterial rm) {
        return RequisicaoMaterialResponseDTO.builder()
                .id(rm.getId())
                .numero(rm.getNumero())
                .data(rm.getData())
                .setor(rm.getSetor())
                .solicitanteNome(rm.getSolicitanteNome())
                .solicitanteCargo(rm.getSolicitanteCargo())
                .urgencia(rm.isUrgencia())
                .encaminhadoPara(rm.getEncaminhadoPara())
                .observacoes(rm.getObservacoes())
                .embarcacaoId(rm.getEmbarcacao() != null ? rm.getEmbarcacao().getId() : null)
                .embarcacaoNome(rm.getEmbarcacao() != null ? rm.getEmbarcacao().getNome() : "")
                .criadoPorNome(rm.getCriadoPor() != null ? rm.getCriadoPor().getName() : "")
                .createdAt(rm.getCreatedAt())
                .itens(rm.getItens().stream().map(i ->
                        RequisicaoMaterialResponseDTO.ItemResponseDTO.builder()
                                .id(i.getId())
                                .descricaoMaterial(i.getDescricaoMaterial())
                                .quantidade(i.getQuantidade())
                                .especificacaoTecnica(i.getEspecificacaoTecnica())
                                .justificativa(i.getJustificativa())
                                .ordem(i.getOrdem())
                                .build()
                ).toList())
                .build();
    }

    private RequisicaoServicoResponseDTO toRSDto(RequisicaoServico rs) {
        return RequisicaoServicoResponseDTO.builder()
                .id(rs.getId())
                .numero(rs.getNumero())
                .data(rs.getData())
                .setor(rs.getSetor())
                .solicitanteNome(rs.getSolicitanteNome())
                .solicitanteCargo(rs.getSolicitanteCargo())
                .urgencia(rs.isUrgencia())
                .servicoSolicitado(rs.getServicoSolicitado())
                .descricaoDetalhada(rs.getDescricaoDetalhada())
                .localExecucao(rs.getLocalExecucao())
                .justificativa(rs.getJustificativa())
                .encaminhadoPara(rs.getEncaminhadoPara())
                .observacoes(rs.getObservacoes())
                .embarcacaoId(rs.getEmbarcacao() != null ? rs.getEmbarcacao().getId() : null)
                .embarcacaoNome(rs.getEmbarcacao() != null ? rs.getEmbarcacao().getNome() : "")
                .criadoPorNome(rs.getCriadoPor() != null ? rs.getCriadoPor().getName() : "")
                .createdAt(rs.getCreatedAt())
                .build();
    }

    // ── PDF Rendering ────────────────────────────────────────────────────────

    private byte[] renderPdf(String html) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF: " + e.getMessage(), e);
        }
    }

    private String logoHtml() {
        if (logoDataUri != null) {
            return "<img src=\"" + logoDataUri + "\" style=\"max-width:110px;max-height:52px;\" />";
        }
        return "<div style=\"font-weight:bold;font-size:13pt;color:#1B9BC4;text-align:center;\">"
                + "SEAPORT<br/><span style=\"font-size:7pt;color:#555;font-weight:normal;\">"
                + "Serviços Marítimos Ltda</span></div>";
    }

    private static String esc(String s) {
        if (s == null || s.isBlank()) return "&#160;";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\n", "<br/>");
    }

    private static final String CSS_COMUM =
            "@page { size: A4; margin: 1.8cm 1.5cm 2.8cm 1.5cm; }" +
            "* { box-sizing: border-box; }" +
            "body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt; color: #111; margin:0; padding:0; }" +
            "table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }" +
            "td, th { border: 1px solid #333; padding: 5px 8px; vertical-align: top; }" +
            ".logo-cell { text-align: center; vertical-align: middle; width: 130px; }" +
            ".main-title { text-align: center; font-size: 11.5pt; font-weight: bold; vertical-align: middle; }" +
            ".lbl { font-size: 7.5pt; color: #555; display: block; margin-bottom: 1px; }" +
            ".val { font-weight: bold; font-size: 9pt; }" +
            "th { background: #f0f0f0; font-size: 8.5pt; text-align: left; }" +
            ".footer { position: fixed; bottom: 0; left: 0; right: 0;" +
            "          border-top: 3px solid #1B9BC4; padding-top: 4px;" +
            "          text-align: center; font-size: 7.5pt; color: #666; background: #fff; }" +
            ".sig-row td { height: 70px; vertical-align: bottom; }" +
            ".sig-line { border-top: 1px solid #333; width: 85%; margin-top: 50px; }";

    // ── HTML: Requisição de Material ─────────────────────────────────────────
    private String buildHtmlRM(RequisicaoMaterial rm) {
        StringBuilder itensHtml = new StringBuilder();
        if (rm.getItens().isEmpty()) {
            itensHtml.append("<tr><td colspan=\"4\" style=\"text-align:center;\">&#8212;</td></tr>");
        } else {
            for (ItemRequisicaoMaterial item : rm.getItens()) {
                itensHtml.append("<tr>")
                        .append("<td>").append(esc(item.getDescricaoMaterial())).append("</td>")
                        .append("<td>").append(esc(item.getQuantidade())).append("</td>")
                        .append("<td>").append(esc(item.getEspecificacaoTecnica())).append("</td>")
                        .append("<td>").append(esc(item.getJustificativa())).append("</td>")
                        .append("</tr>");
            }
        }

        String solicitante = esc(rm.getSolicitanteNome()) + " &#8211; " + esc(rm.getSolicitanteCargo());
        String embarcacaoRow = rm.getEmbarcacao() != null
                ? "<tr><td><b>Embarca&#231;&#227;o:</b></td><td>" + esc(rm.getEmbarcacao().getNome()) + "</td></tr>"
                : "";

        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/><style>" + CSS_COMUM + "</style></head><body>" +
                "<div class=\"footer\">Avenida Dom Lu&#237;s, 1200 Sala 811 &#8211; Aldeota &#160;|&#160; Fortaleza-CE &#160; CEP 60.160-196</div>" +

                // Cabeçalho
                "<table style=\"margin-bottom:0;\">" +
                "<tr><td class=\"logo-cell\" rowspan=\"2\">" + logoHtml() + "</td>" +
                "<td class=\"main-title\" colspan=\"5\">REGISTRO OPERACIONAL</td></tr>" +
                "<tr>" +
                "<td style=\"width:28%;\"><span class=\"lbl\">T&#237;tulo</span><span class=\"val\">REQUISI&#199;&#195;O DE MATERIAL</span></td>" +
                "<td style=\"width:20%;\"><span class=\"lbl\">C&#243;digo</span><span class=\"val\">RG.PS.ADM 4.03.1</span></td>" +
                "<td style=\"width:10%;\"><span class=\"lbl\">Revis&#227;o</span><span class=\"val\">01</span></td>" +
                "<td style=\"width:16%;\"><span class=\"lbl\">Emiss&#227;o</span><span class=\"val\">06/04/2026</span></td>" +
                "<td style=\"width:8%;\"><span class=\"lbl\">P&#225;g</span><span class=\"val\">01</span></td>" +
                "</tr></table>" +

                // Empresa / Data
                "<table>" +
                "<tr><td style=\"width:26%;\"><b>Empresa:</b></td><td>Seaport Servi&#231;os Mar&#237;timos Ltda</td></tr>" +
                "<tr><td><b>Data:</b></td><td>" + rm.getData().format(DATE_FMT) + "</td></tr>" +
                "</table>" +

                // Identificação
                "<table>" +
                "<tr><td style=\"width:26%;\"><b>N&#186; da Requisi&#231;&#227;o:</b></td><td>" + esc(rm.getNumero()) + "</td></tr>" +
                "<tr><td><b>Setor:</b></td><td>" + esc(rm.getSetor()) + "</td></tr>" +
                "<tr><td><b>Solicitante:</b></td><td>" + solicitante + "</td></tr>" +
                "<tr><td><b>Urg&#234;ncia:</b></td><td>" + (rm.isUrgencia() ? "Sim" : "N&#227;o") + "</td></tr>" +
                embarcacaoRow +
                "</table>" +

                // Itens
                "<table>" +
                "<tr><th style=\"width:25%;\">Descri&#231;&#227;o do Material</th>" +
                "<th style=\"width:15%;\">Quantidade</th>" +
                "<th style=\"width:30%;\">Especifica&#231;&#227;o T&#233;cnica</th>" +
                "<th style=\"width:30%;\">Justificativa</th></tr>" +
                itensHtml +
                "</table>" +

                // Assinaturas
                "<table class=\"sig-row\"><tr>" +
                "<td style=\"width:55%;\"><b>Assinatura do Solicitante:</b><div class=\"sig-line\"></div>" +
                "<div style=\"margin-top:4px;\">" + solicitante + "</div></td>" +
                "<td style=\"width:45%;\"><b>Assinatura do Comprador:</b><div class=\"sig-line\" style=\"width:75%;\"></div></td>" +
                "</tr></table>" +

                "<p style=\"margin:14px 0 6px;\">Encaminhado para aprova&#231;&#227;o de: <u>&#160;" + esc(rm.getEncaminhadoPara()) + "&#160;</u></p>" +

                // Data recebimento / Conferência
                "<table><tr>" +
                "<td style=\"width:50%;height:50px;\"><b>Data de Recebimento:</b><br/><br/>____/____/________</td>" +
                "<td style=\"width:50%;\"><b>Confer&#234;ncia:</b><br/><br/>( ) OK &#160;&#160;&#160; ( ) N&#227;o conforme</td>" +
                "</tr></table>" +

                "<p style=\"margin-top:14px;\"><b>Observa&#231;&#245;es:</b></p>" +
                "<p style=\"margin-top:6px;\">" + esc(rm.getObservacoes()) + "</p>" +
                "</body></html>";
    }

    // ── HTML: Requisição de Serviço ──────────────────────────────────────────
    private String buildHtmlRS(RequisicaoServico rs) {
        String solicitante = esc(rs.getSolicitanteNome()) + " &#8211; " + esc(rs.getSolicitanteCargo());
        String embarcacaoRow = rs.getEmbarcacao() != null
                ? "<tr><td><b>Embarca&#231;&#227;o:</b></td><td>" + esc(rs.getEmbarcacao().getNome()) + "</td></tr>"
                : "";

        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/><style>" + CSS_COMUM + "</style></head><body>" +
                "<div class=\"footer\">Avenida Dom Lu&#237;s, 1200 Sala 811 &#8211; Aldeota &#160;|&#160; Fortaleza-CE &#160; CEP 60.160-196</div>" +

                // Cabeçalho
                "<table style=\"margin-bottom:0;\">" +
                "<tr><td class=\"logo-cell\" rowspan=\"2\">" + logoHtml() + "</td>" +
                "<td class=\"main-title\" colspan=\"5\">REGISTRO OPERACIONAL</td></tr>" +
                "<tr>" +
                "<td style=\"width:28%;\"><span class=\"lbl\">T&#237;tulo</span><span class=\"val\">REQUISI&#199;&#195;O DE SERVI&#199;O</span></td>" +
                "<td style=\"width:20%;\"><span class=\"lbl\">C&#243;digo</span><span class=\"val\">RG.PS.ADM 4.03.1</span></td>" +
                "<td style=\"width:10%;\"><span class=\"lbl\">Revis&#227;o</span><span class=\"val\">01</span></td>" +
                "<td style=\"width:16%;\"><span class=\"lbl\">Emiss&#227;o</span><span class=\"val\">06/04/2026</span></td>" +
                "<td style=\"width:8%;\"><span class=\"lbl\">P&#225;g</span><span class=\"val\">01</span></td>" +
                "</tr></table>" +

                // Empresa / Data
                "<table>" +
                "<tr><td style=\"width:26%;\"><b>Empresa:</b></td><td>Seaport Servi&#231;os Mar&#237;timos Ltda</td></tr>" +
                "<tr><td><b>Data:</b></td><td>" + rs.getData().format(DATE_FMT) + "</td></tr>" +
                "</table>" +

                // Identificação
                "<table>" +
                "<tr><td style=\"width:26%;\"><b>N&#186; da Requisi&#231;&#227;o:</b></td><td>" + esc(rs.getNumero()) + "</td></tr>" +
                "<tr><td><b>Setor:</b></td><td>" + esc(rs.getSetor()) + "</td></tr>" +
                "<tr><td><b>Solicitante:</b></td><td>" + solicitante + "</td></tr>" +
                "<tr><td><b>Urg&#234;ncia:</b></td><td>" + (rs.isUrgencia() ? "Sim" : "N&#227;o") + "</td></tr>" +
                embarcacaoRow +
                "</table>" +

                // Serviço
                "<table>" +
                "<tr><td style=\"width:26%;vertical-align:top;\"><b>Servi&#231;o solicitado:</b></td>" +
                "<td>" + esc(rs.getServicoSolicitado()) + "</td></tr>" +
                "<tr><td style=\"vertical-align:top;\"><b>Descri&#231;&#227;o detalhada do servi&#231;o:</b></td>" +
                "<td>" + esc(rs.getDescricaoDetalhada()) + "</td></tr>" +
                "<tr><td><b>Local de execu&#231;&#227;o:</b></td><td>" + esc(rs.getLocalExecucao()) + "</td></tr>" +
                "<tr><td style=\"vertical-align:top;\"><b>Justificativa:</b></td>" +
                "<td>" + esc(rs.getJustificativa()) + "</td></tr>" +
                "</table>" +

                // Assinaturas
                "<table class=\"sig-row\"><tr>" +
                "<td style=\"width:55%;\"><b>Assinatura do Solicitante:</b><div class=\"sig-line\"></div>" +
                "<div style=\"margin-top:4px;\">" + solicitante + "</div></td>" +
                "<td style=\"width:45%;\"><b>Assinatura do Aprovador:</b><div class=\"sig-line\" style=\"width:75%;\"></div></td>" +
                "</tr></table>" +

                "<p style=\"margin:18px 0 6px;\">Encaminhado para aprova&#231;&#227;o de: <u>&#160;" + esc(rs.getEncaminhadoPara()) + "&#160;</u></p>" +

                "<p style=\"margin-top:18px;\"><b>Observa&#231;&#245;es:</b> " +
                (rs.getObservacoes() == null || rs.getObservacoes().isBlank() ? "Nenhuma." : esc(rs.getObservacoes())) +
                "</p>" +
                "</body></html>";
    }
}
