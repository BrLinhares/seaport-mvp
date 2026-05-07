package com.seaport.config;

import com.seaport.entity.Role;
import com.seaport.entity.User;
import com.seaport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.admin.name:Admin Seaport}")
    private String adminName;

    @Value("${app.admin.email:admin@seaport.com.br}")
    private String adminEmail;

    @Value("${app.admin.password:Seaport@2024}")
    private String adminPassword;

    /**
     * (Apenas no perfil dev) Apaga todos os usuários que NÃO sejam o admin,
     * respeitando as FKs: registros dependentes são deletados antes.
     * Roda @Order(1), antes do seed.
     */
    @Bean
    @Order(1)
    @Profile("dev")
    public CommandLineRunner cleanupNonAdminUsers() {
        return args -> {
            long nonAdminCount = userRepository.findAll().stream()
                    .filter(u -> !u.getEmail().equalsIgnoreCase(adminEmail))
                    .count();

            if (nonAdminCount == 0) return;

            log.warn("╔══════════════════════════════════════════════════╗");
            log.warn("║  REMOVENDO {} USUÁRIO(S) NÃO-ADMIN              ║", nonAdminCount);
            log.warn("╚══════════════════════════════════════════════════╝");

            String notAdmin = "LOWER(email) != LOWER(?)";

            // 1. Deleta registros com FK NOT NULL para o usuário não-admin
            jdbcTemplate.update(
                    "DELETE FROM item_requisicao_material WHERE requisicao_id IN " +
                    "(SELECT id FROM requisicao_material WHERE criado_por_id IN (SELECT id FROM users WHERE " + notAdmin + "))",
                    adminEmail);
            jdbcTemplate.update(
                    "DELETE FROM requisicao_material WHERE criado_por_id IN (SELECT id FROM users WHERE " + notAdmin + ")",
                    adminEmail);
            jdbcTemplate.update(
                    "DELETE FROM requisicao_servico WHERE criado_por_id IN (SELECT id FROM users WHERE " + notAdmin + ")",
                    adminEmail);
            jdbcTemplate.update(
                    "DELETE FROM manobra WHERE usuario_id IN (SELECT id FROM users WHERE " + notAdmin + ")",
                    adminEmail);
            jdbcTemplate.update(
                    "DELETE FROM sondagem_tanque WHERE usuario_id IN (SELECT id FROM users WHERE " + notAdmin + ")",
                    adminEmail);
            jdbcTemplate.update(
                    "DELETE FROM registros_operacionais WHERE criador_id IN (SELECT id FROM users WHERE " + notAdmin + ")",
                    adminEmail);
            jdbcTemplate.update(
                    "DELETE FROM password_reset_tokens WHERE user_id IN (SELECT id FROM users WHERE " + notAdmin + ")",
                    adminEmail);

            // 2. Anula FKs nullable (aprovado_por) que apontavam para não-admin
            jdbcTemplate.update(
                    "UPDATE manobra SET aprovado_por_id = NULL WHERE aprovado_por_id IN (SELECT id FROM users WHERE " + notAdmin + ")",
                    adminEmail);
            jdbcTemplate.update(
                    "UPDATE sondagem_tanque SET aprovado_por_id = NULL WHERE aprovado_por_id IN (SELECT id FROM users WHERE " + notAdmin + ")",
                    adminEmail);
            jdbcTemplate.update(
                    "UPDATE registros_operacionais SET aprovado_por_id = NULL WHERE aprovado_por_id IN (SELECT id FROM users WHERE " + notAdmin + ")",
                    adminEmail);

            // 3. Finalmente, apaga os usuários não-admin
            int deleted = jdbcTemplate.update(
                    "DELETE FROM users WHERE " + notAdmin,
                    adminEmail);

            log.info("Limpeza concluída — {} usuário(s) removido(s).", deleted);
        };
    }

    /**
     * Garante que o gerente master sempre exista.
     * Roda @Order(2), após a limpeza.
     */
    @Bean
    @Order(2)
    public CommandLineRunner seedAdminUser() {
        return args -> {
            if (userRepository.existsByEmail(adminEmail)) return;

            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ROLE_GERENTE)
                    .enabled(true)
                    .mustChangePassword(false)
                    .build();

            userRepository.save(admin);

            log.warn("╔══════════════════════════════════════════════╗");
            log.warn("║   GERENTE MASTER CRIADO AUTOMATICAMENTE      ║");
            log.warn("║   Email: {}        ║", adminEmail);
            log.warn("║   Senha: {}              ║", adminPassword);
            log.warn("║   ⚠ TROQUE A SENHA IMEDIATAMENTE!           ║");
            log.warn("╚══════════════════════════════════════════════╝");
        };
    }
}
