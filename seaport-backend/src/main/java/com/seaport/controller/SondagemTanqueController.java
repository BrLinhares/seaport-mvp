package com.seaport.controller;

import com.seaport.dto.sondagem.RejeicaoRequestDTO;
import com.seaport.dto.sondagem.SondagemRequestDTO;
import com.seaport.dto.sondagem.SondagemResponseDTO;
import com.seaport.service.SondagemTanqueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sondagens")
@RequiredArgsConstructor
public class SondagemTanqueController {

    private final SondagemTanqueService sondagemService;

    /** GERENTE: lista todas as sondagens. */
    @GetMapping
    public List<SondagemResponseDTO> listarTodas(Authentication auth) {
        return sondagemService.listarTodas();
    }

    /** TRIPULACAO: lista sondagens da sua embarcação. */
    @GetMapping("/minha-embarcacao")
    public List<SondagemResponseDTO> listarMinhaEmbarcacao(Authentication auth) {
        return sondagemService.listarMinhaEmbarcacao(auth);
    }

    /** DIRETORIA / GERENTE: somente sondagens aprovadas. */
    @GetMapping("/aprovadas")
    public List<SondagemResponseDTO> listarAprovadas(Authentication auth) {
        return sondagemService.listarAprovadas();
    }

    /** TRIPULACAO: registra uma nova sondagem. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SondagemResponseDTO criar(@Valid @RequestBody SondagemRequestDTO dto,
                                     Authentication auth) {
        return sondagemService.criar(dto, auth);
    }

    /** GERENTE: aprova uma sondagem pendente. */
    @PutMapping("/{id}/aprovar")
    public SondagemResponseDTO aprovar(@PathVariable Long id, Authentication auth) {
        return sondagemService.aprovar(id, auth);
    }

    /** GERENTE: rejeita uma sondagem pendente com motivo. */
    @PutMapping("/{id}/rejeitar")
    public SondagemResponseDTO rejeitar(@PathVariable Long id,
                                         @Valid @RequestBody RejeicaoRequestDTO dto,
                                         Authentication auth) {
        return sondagemService.rejeitar(id, dto, auth);
    }
}
