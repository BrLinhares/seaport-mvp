package com.seaport.controller;

import com.seaport.dto.embarcacao.EmbarcacaoDashboardDTO;
import com.seaport.dto.embarcacao.EmbarcacaoRequestDTO;
import com.seaport.dto.embarcacao.EmbarcacaoResponseDTO;
import com.seaport.dto.embarcacao.EmbarcacaoSummaryDTO;
import com.seaport.service.EmbarcacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/embarcacoes")
@RequiredArgsConstructor
public class EmbarcacaoController {

    private final EmbarcacaoService embarcacaoService;

    @GetMapping
    public ResponseEntity<List<EmbarcacaoSummaryDTO>> listarTodos() {
        return ResponseEntity.ok(embarcacaoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmbarcacaoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(embarcacaoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<EmbarcacaoResponseDTO> criar(@Valid @RequestBody EmbarcacaoRequestDTO dto) {
        EmbarcacaoResponseDTO criada = embarcacaoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmbarcacaoResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody EmbarcacaoRequestDTO dto) {
        return ResponseEntity.ok(embarcacaoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        embarcacaoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<EmbarcacaoDashboardDTO> getDashboard(@PathVariable Long id) {
        return ResponseEntity.ok(embarcacaoService.getDashboard(id));
    }
}
