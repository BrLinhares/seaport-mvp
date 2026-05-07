package com.seaport.controller;

import com.seaport.dto.CreateUserRequest;
import com.seaport.dto.UpdateUserRequest;
import com.seaport.entity.Embarcacao;
import com.seaport.entity.Role;
import com.seaport.entity.User;
import com.seaport.repository.EmbarcacaoRepository;
import com.seaport.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final EmbarcacaoRepository embarcacaoRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Perfil próprio ──────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(buildMap(findByEmail(userDetails.getUsername())));
    }

    // ── Listagem (GERENTE) ──────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(userRepository.findAllFetchEmbarcacao().stream().map(this::buildMap).toList());
    }

    // ── Criar usuário (GERENTE) ─────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        Role role = parseRole(req.getRole());

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .enabled(true)
                .mustChangePassword(true)  // força troca no primeiro login
                .build();

        if (role == Role.ROLE_TRIPULACAO && req.getEmbarcacaoId() != null) {
            user.setEmbarcacao(findEmbarcacao(req.getEmbarcacaoId()));
        }

        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildMap(user));
    }

    // ── Atualizar usuário (GERENTE) ─────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest req) {
        User user = findById(id);
        Role novaRole = parseRole(req.getRole());

        user.setName(req.getName());
        user.setRole(novaRole);
        user.setEnabled(req.isEnabled());

        if (novaRole == Role.ROLE_TRIPULACAO && req.getEmbarcacaoId() != null) {
            user.setEmbarcacao(findEmbarcacao(req.getEmbarcacaoId()));
        } else {
            user.setEmbarcacao(null);
        }

        userRepository.save(user);
        return ResponseEntity.ok(buildMap(user));
    }

    // ── Resetar senha (GERENTE define senha temporária) ────────────────────

    @PutMapping("/{id}/resetar-senha")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<?> resetarSenha(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String novaSenha = body.get("newPassword");
        if (novaSenha == null || novaSenha.length() < 8) {
            throw new IllegalArgumentException("Senha deve ter no mínimo 8 caracteres");
        }

        User user = findById(id);
        user.setPassword(passwordEncoder.encode(novaSenha));
        user.setMustChangePassword(true);  // obriga o usuário a trocar
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Senha resetada. Usuário deverá trocar no próximo login."));
    }

    // ── Ativar/desativar (GERENTE) ──────────────────────────────────────────

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('GERENTE')")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        User user = findById(id);
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        return ResponseEntity.ok(buildMap(user));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private User findById(Long id) {
        return userRepository.findByIdFetchEmbarcacao(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmailFetchEmbarcacao(email)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
    }

    private Embarcacao findEmbarcacao(Long id) {
        return embarcacaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Embarcação não encontrada: " + id));
    }

    private Role parseRole(String role) {
        try {
            return Role.valueOf(role);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Perfil inválido: " + role);
        }
    }

    private Map<String, Object> buildMap(User u) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id",               u.getId());
        map.put("name",             u.getName()   != null ? u.getName()          : "");
        map.put("email",            u.getEmail()  != null ? u.getEmail()         : "");
        map.put("role",             u.getRole()   != null ? u.getRole().name()   : "");
        map.put("enabled",          u.isEnabled());
        map.put("mustChangePassword", u.isMustChangePassword());
        map.put("embarcacaoId",     u.getEmbarcacao() != null ? u.getEmbarcacao().getId()   : "");
        map.put("embarcacaoNome",   u.getEmbarcacao() != null ? u.getEmbarcacao().getNome() : "");
        map.put("createdAt",        u.getCreatedAt() != null ? u.getCreatedAt().toString()  : "");
        return map;
    }
}
