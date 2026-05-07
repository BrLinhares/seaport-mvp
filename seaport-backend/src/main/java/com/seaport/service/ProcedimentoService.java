package com.seaport.service;

import com.seaport.dto.procedimento.ProcedimentoRequestDTO;
import com.seaport.dto.procedimento.ProcedimentoResponseDTO;
import com.seaport.entity.Procedimento;
import com.seaport.entity.ProcedimentoPermissaoRole;
import com.seaport.entity.Role;
import com.seaport.repository.ProcedimentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcedimentoService {

    private final ProcedimentoRepository procedimentoRepository;
    private final StorageService storageService;

    // -------------------------------------------------------------------------
    // Consulta
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ProcedimentoResponseDTO> listar(Authentication auth) {
        String role = extractRole(auth);
        List<Procedimento> lista;

        if ("ROLE_DIRETORIA".equals(role) || "ROLE_GERENTE".equals(role)) {
            lista = procedimentoRepository.findByAtivoTrueOrderByParteAscTituloAsc();
        } else {
            lista = procedimentoRepository.findAtivosByRole(Role.valueOf(role));
        }

        return lista.stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public ProcedimentoResponseDTO buscarPorId(Long id, Authentication auth) {
        Procedimento p = findAtivo(id);
        verificarAcesso(p, auth);
        return toDTO(p);
    }

    @Transactional(readOnly = true)
    public Resource getArquivo(Long id, Authentication auth) throws IOException {
        Procedimento p = findAtivo(id);
        verificarAcesso(p, auth);

        if (p.getArquivoPdf() == null || p.getArquivoPdf().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Este procedimento não possui arquivo PDF.");
        }
        return storageService.load(p.getArquivoPdf());
    }

    // -------------------------------------------------------------------------
    // Escrita (apenas GERENTE)
    // -------------------------------------------------------------------------

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public ProcedimentoResponseDTO criar(ProcedimentoRequestDTO dto, MultipartFile arquivo) throws IOException {
        validarCamposObrigatorios(dto);
        validarCodigoUnico(dto.getCodigo(), null);

        Procedimento p = Procedimento.builder()
                .titulo(dto.getTitulo())
                .codigo(dto.getCodigo().toUpperCase().strip())
                .revisao(dto.getRevisao())
                .dataEmissao(dto.getDataEmissao())
                .parte(dto.getParte())
                .build();

        if (arquivo != null && !arquivo.isEmpty()) {
            p.setArquivoPdf(storageService.storePdf(arquivo, "procedimentos"));
        }

        aplicarPermissoes(p, dto.getRolesPermitidas());
        return toDTO(procedimentoRepository.save(p));
    }

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public ProcedimentoResponseDTO atualizar(Long id, ProcedimentoRequestDTO dto, MultipartFile arquivo) throws IOException {
        validarCamposObrigatorios(dto);
        Procedimento p = findQualquer(id);
        validarCodigoUnico(dto.getCodigo(), id);

        p.setTitulo(dto.getTitulo());
        p.setCodigo(dto.getCodigo().toUpperCase().strip());
        p.setRevisao(dto.getRevisao());
        p.setDataEmissao(dto.getDataEmissao());
        p.setParte(dto.getParte());

        if (arquivo != null && !arquivo.isEmpty()) {
            if (p.getArquivoPdf() != null) storageService.delete(p.getArquivoPdf());
            p.setArquivoPdf(storageService.storePdf(arquivo, "procedimentos"));
        }

        p.getPermissoes().clear();
        aplicarPermissoes(p, dto.getRolesPermitidas());

        return toDTO(procedimentoRepository.save(p));
    }

    @Transactional
    @PreAuthorize("hasRole('GERENTE')")
    public void inativar(Long id) {
        Procedimento p = findQualquer(id);
        if (!p.isAtivo()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Procedimento já está inativo.");
        }
        p.setAtivo(false);
        procedimentoRepository.save(p);
    }

    // -------------------------------------------------------------------------
    // Helpers privados
    // -------------------------------------------------------------------------

    private Procedimento findAtivo(Long id) {
        return procedimentoRepository.findById(id)
                .filter(Procedimento::isAtivo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Procedimento não encontrado."));
    }

    private Procedimento findQualquer(Long id) {
        return procedimentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Procedimento não encontrado."));
    }

    private void verificarAcesso(Procedimento p, Authentication auth) {
        String role = extractRole(auth);
        // DIRETORIA e GERENTE têm acesso irrestrito
        if ("ROLE_DIRETORIA".equals(role) || "ROLE_GERENTE".equals(role)) return;

        Role userRole = Role.valueOf(role);
        boolean temPermissao = p.getPermissoes().stream()
                .anyMatch(perm -> perm.getRole() == userRole);
        if (!temPermissao) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem permissão para acessar este procedimento.");
        }
    }

    private void aplicarPermissoes(Procedimento p, List<String> roles) {
        if (roles == null || roles.isEmpty()) return;
        for (String roleStr : roles) {
            try {
                Role r = Role.valueOf(roleStr);
                p.getPermissoes().add(
                        ProcedimentoPermissaoRole.builder()
                                .procedimento(p)
                                .role(r)
                                .build()
                );
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role inválida: " + roleStr);
            }
        }
    }

    private void validarCamposObrigatorios(ProcedimentoRequestDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Título é obrigatório.");
        if (dto.getCodigo() == null || dto.getCodigo().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código é obrigatório.");
        if (dto.getParte() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parte é obrigatória.");
    }

    private void validarCodigoUnico(String codigo, Long idIgnorar) {
        String upper = codigo.toUpperCase().strip();
        boolean existe = (idIgnorar == null)
                ? procedimentoRepository.existsByCodigo(upper)
                : procedimentoRepository.existsByCodigoAndIdNot(upper, idIgnorar);
        if (existe) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Já existe um procedimento com o código '" + upper + "'.");
        }
    }

    private String extractRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .findFirst()
                .orElse("ROLE_TRIPULACAO");
    }

    private ProcedimentoResponseDTO toDTO(Procedimento p) {
        return ProcedimentoResponseDTO.builder()
                .id(p.getId())
                .titulo(p.getTitulo())
                .codigo(p.getCodigo())
                .revisao(p.getRevisao())
                .dataEmissao(p.getDataEmissao())
                .parte(p.getParte())
                .parteDescricao(p.getParte().getDescricao())
                .ativo(p.isAtivo())
                .temArquivo(p.getArquivoPdf() != null && !p.getArquivoPdf().isBlank())
                .dataCadastro(p.getDataCadastro())
                .rolesPermitidas(p.getPermissoes().stream().map(perm -> perm.getRole().name()).toList())
                .build();
    }
}
