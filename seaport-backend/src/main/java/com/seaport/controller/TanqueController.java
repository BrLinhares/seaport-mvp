package com.seaport.controller;

import com.seaport.dto.tanque.TanqueCreateDTO;
import com.seaport.dto.tanque.TanqueDTO;
import com.seaport.dto.tanque.TanqueResponseDTO;
import com.seaport.service.TanqueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TanqueController {

    private final TanqueService tanqueService;

    /** Lista tanques de uma embarcação. */
    @GetMapping("/api/embarcacoes/{embarcacaoId}/tanques")
    public ResponseEntity<List<TanqueResponseDTO>> listarPorEmbarcacao(
            @PathVariable Long embarcacaoId) {
        return ResponseEntity.ok(tanqueService.listarPorEmbarcacao(embarcacaoId));
    }

    /** Criação avulsa de tanque (sem ser inline com a embarcação). */
    @PostMapping("/api/tanques")
    public ResponseEntity<TanqueResponseDTO> criar(
            @Valid @RequestBody TanqueCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tanqueService.criar(dto));
    }

    /** Atualização de tanque. */
    @PutMapping("/api/tanques/{id}")
    public ResponseEntity<TanqueResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody TanqueDTO dto) {
        return ResponseEntity.ok(tanqueService.atualizar(id, dto));
    }

    /** Exclusão de tanque. */
    @DeleteMapping("/api/tanques/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        tanqueService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
