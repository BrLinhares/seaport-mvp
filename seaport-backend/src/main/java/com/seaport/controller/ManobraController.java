package com.seaport.controller;

import com.seaport.dto.manobra.ManobraRequestDTO;
import com.seaport.dto.manobra.ManobraResponseDTO;
import com.seaport.dto.manobra.RejeicaoManobraRequestDTO;
import com.seaport.service.ManobraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manobras")
@RequiredArgsConstructor
public class ManobraController {

    private final ManobraService manobraService;

    /** GERENTE: lista todas as manobras. */
    @GetMapping
    public List<ManobraResponseDTO> listarTodas(Authentication auth) {
        return manobraService.listarTodas();
    }

    /** TRIPULACAO: lista manobras da sua embarcação. */
    @GetMapping("/minha-embarcacao")
    public List<ManobraResponseDTO> listarMinhaEmbarcacao(Authentication auth) {
        return manobraService.listarMinhaEmbarcacao(auth);
    }

    /** DIRETORIA / GERENTE: somente manobras aprovadas. */
    @GetMapping("/aprovadas")
    public List<ManobraResponseDTO> listarAprovadas(Authentication auth) {
        return manobraService.listarAprovadas();
    }

    /** TRIPULACAO: registra uma nova manobra. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ManobraResponseDTO criar(@Valid @RequestBody ManobraRequestDTO dto,
                                    Authentication auth) {
        return manobraService.criar(dto, auth);
    }

    /** GERENTE: aprova uma manobra pendente. */
    @PutMapping("/{id}/aprovar")
    public ManobraResponseDTO aprovar(@PathVariable Long id, Authentication auth) {
        return manobraService.aprovar(id, auth);
    }

    /** GERENTE: rejeita uma manobra pendente com motivo. */
    @PutMapping("/{id}/rejeitar")
    public ManobraResponseDTO rejeitar(@PathVariable Long id,
                                       @Valid @RequestBody RejeicaoManobraRequestDTO dto,
                                       Authentication auth) {
        return manobraService.rejeitar(id, dto, auth);
    }
}
