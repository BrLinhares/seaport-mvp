package com.seaport.controller;

import com.seaport.dto.tripulante.TripulanteRequestDTO;
import com.seaport.dto.tripulante.TripulanteResponseDTO;
import com.seaport.service.StorageService;
import com.seaport.service.TripulanteService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TripulanteController {

    private final TripulanteService tripulanteService;
    private final StorageService storageService;

    /** Lista paginada com filtros opcionais. */
    @GetMapping("/tripulantes")
    public ResponseEntity<Page<TripulanteResponseDTO>> listar(
            @RequestParam(required = false) Long embarcacaoId,
            @RequestParam(required = false) Boolean ativo,
            @RequestParam(required = false) String nome,
            @PageableDefault(size = 20, sort = "nomeCompleto") Pageable pageable) {
        return ResponseEntity.ok(
                tripulanteService.listarComFiltros(embarcacaoId, ativo, nome, pageable));
    }

    /** Lista todos os tripulantes de uma embarcação. */
    @GetMapping("/embarcacoes/{embarcacaoId}/tripulantes")
    public ResponseEntity<List<TripulanteResponseDTO>> listarPorEmbarcacao(
            @PathVariable Long embarcacaoId) {
        return ResponseEntity.ok(tripulanteService.listarPorEmbarcacao(embarcacaoId));
    }

    @GetMapping("/tripulantes/{id}")
    public ResponseEntity<TripulanteResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tripulanteService.buscarPorId(id));
    }

    /**
     * Cria tripulante via multipart/form-data.
     * O arquivo CIR (foto ou PDF) é opcional — pode ser enviado já no cadastro inicial.
     */
    @PostMapping(value = "/tripulantes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TripulanteResponseDTO> criar(
            @RequestParam(required = false) Long embarcacaoId,
            @RequestParam String nomeCompleto,
            @RequestParam(required = false) String numeroCIR,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataVencimentoCIR,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String funcaoBase,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataEntradaEmpresa,
            @RequestPart(required = false) MultipartFile arquivo) throws IOException {

        TripulanteRequestDTO dto = buildDTO(embarcacaoId, nomeCompleto, numeroCIR,
                dataVencimentoCIR, categoria, funcaoBase, dataEntradaEmpresa);
        return ResponseEntity.status(HttpStatus.CREATED).body(tripulanteService.criar(dto, arquivo));
    }

    /**
     * Atualiza tripulante via multipart/form-data.
     * Se {@code arquivo} for omitido, o documento CIR atual é mantido.
     */
    @PutMapping(value = "/tripulantes/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TripulanteResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestParam(required = false) Long embarcacaoId,
            @RequestParam String nomeCompleto,
            @RequestParam(required = false) String numeroCIR,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataVencimentoCIR,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String funcaoBase,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataEntradaEmpresa,
            @RequestPart(required = false) MultipartFile arquivo) throws IOException {

        TripulanteRequestDTO dto = buildDTO(embarcacaoId, nomeCompleto, numeroCIR,
                dataVencimentoCIR, categoria, funcaoBase, dataEntradaEmpresa);
        return ResponseEntity.ok(tripulanteService.atualizar(id, dto, arquivo));
    }

    /** Soft-delete: marca ativo = false. */
    @PatchMapping("/tripulantes/{id}/inativar")
    public ResponseEntity<TripulanteResponseDTO> inativar(@PathVariable Long id) {
        return ResponseEntity.ok(tripulanteService.inativar(id));
    }

    /** Reativa um tripulante previamente inativo. */
    @PatchMapping("/tripulantes/{id}/ativar")
    public ResponseEntity<TripulanteResponseDTO> ativar(@PathVariable Long id) {
        return ResponseEntity.ok(tripulanteService.ativar(id));
    }

    /**
     * Substitui o documento CIR por upload avulso (endpoint legado, mantido por compatibilidade).
     * Prefira enviar o arquivo diretamente no POST/PUT do tripulante.
     */
    @PostMapping(value = "/tripulantes/{id}/documento",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TripulanteResponseDTO> uploadDocumento(
            @PathVariable Long id,
            @RequestParam("arquivo") MultipartFile arquivo) throws IOException {
        return ResponseEntity.ok(tripulanteService.uploadDocumento(id, arquivo));
    }

    /** Serve o arquivo de documento — requer autenticação (coberto por anyRequest). */
    @GetMapping("/uploads/{subdir}/{filename:.+}")
    public ResponseEntity<Resource> servirArquivo(
            @PathVariable String subdir,
            @PathVariable String filename) throws MalformedURLException {
        String relativePath = subdir + "/" + filename;
        Resource resource = storageService.load(relativePath);
        String contentType = filename.toLowerCase().endsWith(".pdf")
                ? MediaType.APPLICATION_PDF_VALUE
                : MediaType.IMAGE_JPEG_VALUE;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    // -------------------------------------------------------------------------

    private TripulanteRequestDTO buildDTO(Long embarcacaoId, String nomeCompleto, String numeroCIR,
                                          LocalDate dataVencimentoCIR, String categoria,
                                          String funcaoBase, LocalDate dataEntradaEmpresa) {
        TripulanteRequestDTO dto = new TripulanteRequestDTO();
        dto.setEmbarcacaoId(embarcacaoId);
        dto.setNomeCompleto(nomeCompleto);
        dto.setNumeroCIR(numeroCIR);
        dto.setDataVencimentoCIR(dataVencimentoCIR);
        dto.setCategoria(categoria);
        dto.setFuncaoBase(funcaoBase);
        dto.setDataEntradaEmpresa(dataEntradaEmpresa);
        return dto;
    }
}
