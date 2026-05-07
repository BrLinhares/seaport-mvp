package com.seaport.controller;

import com.seaport.dto.requisicao.*;
import com.seaport.service.RequisicaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requisicoes")
@RequiredArgsConstructor
public class RequisicaoController {

    private final RequisicaoService service;

    // ── Requisição de Material ───────────────────────────────────────────────

    @GetMapping("/materiais")
    public ResponseEntity<List<RequisicaoMaterialResponseDTO>> listarMateriais() {
        return ResponseEntity.ok(service.listarMateriais());
    }

    @GetMapping("/materiais/{id}")
    public ResponseEntity<RequisicaoMaterialResponseDTO> buscarMaterial(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarMaterial(id));
    }

    @PostMapping("/materiais")
    public ResponseEntity<RequisicaoMaterialResponseDTO> criarMaterial(
            @Valid @RequestBody RequisicaoMaterialRequestDTO dto,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarMaterial(dto, auth));
    }

    @DeleteMapping("/materiais/{id}")
    public ResponseEntity<Void> deletarMaterial(@PathVariable Long id) {
        service.deletarMaterial(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/materiais/{id}/pdf")
    public ResponseEntity<byte[]> pdfMaterial(@PathVariable Long id) {
        byte[] pdf = service.gerarPdfMaterial(id);
        RequisicaoMaterialResponseDTO rm = service.buscarMaterial(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + rm.getNumero() + ".pdf\"")
                .body(pdf);
    }

    // ── Requisição de Serviço ────────────────────────────────────────────────

    @GetMapping("/servicos")
    public ResponseEntity<List<RequisicaoServicoResponseDTO>> listarServicos() {
        return ResponseEntity.ok(service.listarServicos());
    }

    @GetMapping("/servicos/{id}")
    public ResponseEntity<RequisicaoServicoResponseDTO> buscarServico(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarServico(id));
    }

    @PostMapping("/servicos")
    public ResponseEntity<RequisicaoServicoResponseDTO> criarServico(
            @Valid @RequestBody RequisicaoServicoRequestDTO dto,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criarServico(dto, auth));
    }

    @DeleteMapping("/servicos/{id}")
    public ResponseEntity<Void> deletarServico(@PathVariable Long id) {
        service.deletarServico(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/servicos/{id}/pdf")
    public ResponseEntity<byte[]> pdfServico(@PathVariable Long id) {
        byte[] pdf = service.gerarPdfServico(id);
        RequisicaoServicoResponseDTO rs = service.buscarServico(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + rs.getNumero() + ".pdf\"")
                .body(pdf);
    }
}
