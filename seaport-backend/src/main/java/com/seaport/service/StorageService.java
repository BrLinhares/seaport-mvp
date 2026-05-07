package com.seaport.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class StorageService {

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final long MAX_SIZE_BYTES = 10 * 1024 * 1024L; // 10 MB

    @Value("${app.storage.location:./uploads}")
    private String storageLocation;

    private Path rootPath;

    @PostConstruct
    public void init() {
        rootPath = Paths.get(storageLocation).toAbsolutePath().normalize();
        try {
            Files.createDirectories(rootPath);
            log.info("Storage inicializado em: {}", rootPath);
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível criar o diretório de upload: " + rootPath, e);
        }
    }

    /**
     * Armazena o arquivo em {@code {storageLocation}/{subdir}/} e retorna o
     * caminho relativo (ex: {@code tripulantes/abc123.pdf}) para ser salvo no banco.
     */
    public String store(MultipartFile file, String subdir) throws IOException {
        validarArquivo(file);

        String ext       = obterExtensao(file.getOriginalFilename());
        String filename  = UUID.randomUUID() + "." + ext;
        Path   destDir   = rootPath.resolve(subdir);
        Files.createDirectories(destDir);
        Path   destPath  = destDir.resolve(filename);

        Files.copy(file.getInputStream(), destPath, StandardCopyOption.REPLACE_EXISTING);
        log.debug("Arquivo salvo: {}", destPath);
        return subdir + "/" + filename;
    }

    /**
     * Carrega um arquivo pelo caminho relativo (como foi salvo no banco).
     */
    public Resource load(String relativePath) throws MalformedURLException {
        Path filePath = rootPath.resolve(relativePath).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) {
            throw new IllegalArgumentException("Arquivo não encontrado: " + relativePath);
        }
        return resource;
    }

    /**
     * Armazena exclusivamente arquivos PDF em {@code {storageLocation}/{subdir}/}.
     * Lança {@link IllegalArgumentException} se o arquivo não for PDF.
     */
    public String storePdf(MultipartFile file, String subdir) throws IOException {
        validarPdf(file);
        String filename = UUID.randomUUID() + ".pdf";
        Path destDir = rootPath.resolve(subdir);
        Files.createDirectories(destDir);
        Path destPath = destDir.resolve(filename);
        Files.copy(file.getInputStream(), destPath, StandardCopyOption.REPLACE_EXISTING);
        log.debug("PDF salvo: {}", destPath);
        return subdir + "/" + filename;
    }

    /**
     * Remove um arquivo do disco (chamado ao inativar/substituir documento).
     */
    public void delete(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return;
        try {
            Path filePath = rootPath.resolve(relativePath).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Não foi possível remover arquivo: {}", relativePath, e);
        }
    }

    // -----------------------------------------------------------------------

    private void validarPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("Arquivo excede o limite de 10 MB");
        }
        String contentType = file.getContentType();
        if (!"application/pdf".equalsIgnoreCase(contentType)) {
            throw new IllegalArgumentException(
                "Apenas arquivos PDF são permitidos. Recebido: " + contentType);
        }
    }

    private void validarArquivo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("Arquivo excede o limite de 10 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !TIPOS_PERMITIDOS.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                "Tipo de arquivo não permitido. Use PDF, JPEG ou PNG. Recebido: " + contentType);
        }
    }

    private String obterExtensao(String filename) {
        if (filename == null || !filename.contains(".")) return "bin";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
