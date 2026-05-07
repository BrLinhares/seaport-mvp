package com.seaport.controller;

import com.seaport.dto.registro.AprovarRejeitarDTO;
import com.seaport.dto.registro.RegistroRequestDTO;
import com.seaport.dto.registro.RegistroResponseDTO;
import com.seaport.entity.StatusRegistro;
import com.seaport.service.RegistroOperacionalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registros")
@RequiredArgsConstructor
public class RegistroOperacionalController {

    private final RegistroOperacionalService service;

    // TRIPULAÇÃO: cria registro (sempre PENDENTE)
    @PostMapping
    public ResponseEntity<RegistroResponseDTO> criar(
            @Valid @RequestBody RegistroRequestDTO dto,
            @AuthenticationPrincipal UserDetails user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.criar(dto, user.getUsername()));
    }

    // TRIPULAÇÃO: lista registros da própria embarcação
    @GetMapping("/minha-embarcacao")
    public ResponseEntity<List<RegistroResponseDTO>> listarMinhaEmbarcacao(
            @AuthenticationPrincipal UserDetails user
    ) {
        return ResponseEntity.ok(service.listarMinhaEmbarcacao(user.getUsername()));
    }

    // GERENTE/DIRETORIA: lista todos com filtro opcional por status
    @GetMapping
    public ResponseEntity<Page<RegistroResponseDTO>> listarTodos(
            @RequestParam(required = false) StatusRegistro status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(service.listarTodos(status, pageable));
    }

    // DIRETORIA/GERENTE: apenas aprovados
    @GetMapping("/aprovados")
    public ResponseEntity<List<RegistroResponseDTO>> listarAprovados() {
        return ResponseEntity.ok(service.listarAprovados());
    }

    // GERENTE: aprovar
    @PutMapping("/{id}/aprovar")
    public ResponseEntity<RegistroResponseDTO> aprovar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user
    ) {
        return ResponseEntity.ok(service.aprovar(id, user.getUsername()));
    }

    // GERENTE: rejeitar (com motivo obrigatório)
    @PutMapping("/{id}/rejeitar")
    public ResponseEntity<RegistroResponseDTO> rejeitar(
            @PathVariable Long id,
            @RequestBody AprovarRejeitarDTO dto,
            @AuthenticationPrincipal UserDetails user
    ) {
        return ResponseEntity.ok(service.rejeitar(id, dto, user.getUsername()));
    }
}
