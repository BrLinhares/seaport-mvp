package com.seaport.controller;

import com.seaport.dto.procedimento.ProcedimentoRequestDTO;
import com.seaport.dto.procedimento.ProcedimentoResponseDTO;
import com.seaport.entity.ParteProcedimento;
import com.seaport.service.ProcedimentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/procedimentos")
@RequiredArgsConstructor
public class ProcedimentoController {

    private final ProcedimentoService procedimentoService;

    /** Lista procedimentos filtrados pelo perfil do usuário logado. */
    @GetMapping
    public List<ProcedimentoResponseDTO> listar(Authentication auth) {
        return procedimentoService.listar(auth);
    }

    /** Detalhe de um procedimento específico (com verificação de acesso). */
    @GetMapping("/{id}")
    public ProcedimentoResponseDTO buscar(@PathVariable Long id, Authentication auth) {
        return procedimentoService.buscarPorId(id, auth);
    }

    /**
     * Serve o PDF do procedimento.
     *
     * @param disposition {@code inline} (padrão — abre no browser) ou {@code download}
     */
    @GetMapping("/{id}/arquivo")
    public ResponseEntity<Resource> getArquivo(
            @PathVariable Long id,
            @RequestParam(defaultValue = "inline") String disposition,
            Authentication auth) throws IOException {

        Resource resource = procedimentoService.getArquivo(id, auth);

        ContentDisposition cd = "download".equals(disposition)
                ? ContentDisposition.attachment().filename(resource.getFilename()).build()
                : ContentDisposition.inline().filename(resource.getFilename()).build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, cd.toString())
                .body(resource);
    }

    /** Cria um novo procedimento. Campos enviados como multipart/form-data. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ProcedimentoResponseDTO criar(
            @RequestParam String titulo,
            @RequestParam String codigo,
            @RequestParam(required = false) String revisao,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataEmissao,
            @RequestParam ParteProcedimento parte,
            @RequestParam(required = false) List<String> rolesPermitidas,
            @RequestPart(required = false) MultipartFile arquivo,
            Authentication auth) throws IOException {

        ProcedimentoRequestDTO dto = buildDTO(titulo, codigo, revisao, dataEmissao, parte, rolesPermitidas);
        return procedimentoService.criar(dto, arquivo);
    }

    /** Atualiza um procedimento existente. O arquivo é opcional — se omitido, o atual é mantido. */
    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProcedimentoResponseDTO atualizar(
            @PathVariable Long id,
            @RequestParam String titulo,
            @RequestParam String codigo,
            @RequestParam(required = false) String revisao,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataEmissao,
            @RequestParam ParteProcedimento parte,
            @RequestParam(required = false) List<String> rolesPermitidas,
            @RequestPart(required = false) MultipartFile arquivo,
            Authentication auth) throws IOException {

        ProcedimentoRequestDTO dto = buildDTO(titulo, codigo, revisao, dataEmissao, parte, rolesPermitidas);
        return procedimentoService.atualizar(id, dto, arquivo);
    }

    /** Inativa (soft-delete) o procedimento. */
    @PatchMapping("/{id}/inativar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void inativar(@PathVariable Long id, Authentication auth) {
        procedimentoService.inativar(id);
    }

    // -------------------------------------------------------------------------

    private ProcedimentoRequestDTO buildDTO(String titulo, String codigo, String revisao,
                                             LocalDate dataEmissao, ParteProcedimento parte,
                                             List<String> rolesPermitidas) {
        ProcedimentoRequestDTO dto = new ProcedimentoRequestDTO();
        dto.setTitulo(titulo);
        dto.setCodigo(codigo);
        dto.setRevisao(revisao);
        dto.setDataEmissao(dataEmissao);
        dto.setParte(parte);
        dto.setRolesPermitidas(rolesPermitidas);
        return dto;
    }
}
