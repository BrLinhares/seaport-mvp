package com.seaport.controller;

import com.seaport.dto.tripulante.EscalaRequestDTO;
import com.seaport.dto.tripulante.EscalaResponseDTO;
import com.seaport.service.EscalaTripulacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EscalaTripulacaoController {

    private final EscalaTripulacaoService escalaService;

    /** Escala ativa (turno aberto) de uma embarcação. */
    @GetMapping("/embarcacoes/{embarcacaoId}/escala")
    public ResponseEntity<List<EscalaResponseDTO>> listarAtivasPorEmbarcacao(
            @PathVariable Long embarcacaoId) {
        return ResponseEntity.ok(escalaService.listarAtivaPorEmbarcacao(embarcacaoId));
    }

    /** Histórico completo de escala de uma embarcação. */
    @GetMapping("/embarcacoes/{embarcacaoId}/escala/historico")
    public ResponseEntity<List<EscalaResponseDTO>> listarHistoricoPorEmbarcacao(
            @PathVariable Long embarcacaoId) {
        return ResponseEntity.ok(escalaService.listarHistoricoPorEmbarcacao(embarcacaoId));
    }

    @PostMapping("/escala")
    public ResponseEntity<EscalaResponseDTO> criar(
            @Valid @RequestBody EscalaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(escalaService.criar(dto));
    }

    @PutMapping("/escala/{id}")
    public ResponseEntity<EscalaResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody EscalaRequestDTO dto) {
        return ResponseEntity.ok(escalaService.atualizar(id, dto));
    }

    /** Encerra o turno: define dataFim=hoje, ativo=false. Preserva histórico. */
    @PatchMapping("/escala/{id}/encerrar")
    public ResponseEntity<EscalaResponseDTO> encerrar(@PathVariable Long id) {
        return ResponseEntity.ok(escalaService.encerrar(id));
    }
}
