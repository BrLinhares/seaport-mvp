package com.seaport.config;

import com.seaport.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // habilita @PreAuthorize nos services
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/**",
            "/h2-console/**",
            "/actuator/health",
            "/actuator/info"
    };

    /** Endpoints que exigem autenticação mas qualquer role pode acessar. */
    private static final String[] AUTHENTICATED_ENDPOINTS = {
            "/api/uploads/**",
            "/api/tripulantes/**",
            "/api/embarcacoes/*/tripulantes",
            "/api/embarcacoes/*/escala/**",
            "/api/escala/**",
            "/api/procedimentos/**",
            "/api/sondagens/**",
            "/api/manobras/**",
            "/api/requisicoes/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(AUTHENTICATED_ENDPOINTS).authenticated()

                        // Embarcações: GERENTE escreve, todos leem
                        .requestMatchers(HttpMethod.POST, "/api/embarcacoes/**").hasRole("GERENTE")
                        .requestMatchers(HttpMethod.PUT, "/api/embarcacoes/**").hasRole("GERENTE")
                        .requestMatchers(HttpMethod.DELETE, "/api/embarcacoes/**").hasRole("GERENTE")
                        .requestMatchers(HttpMethod.GET, "/api/embarcacoes/**")
                                .hasAnyRole("GERENTE", "DIRETORIA", "TRIPULACAO")

                        // Registros operacionais
                        .requestMatchers(HttpMethod.POST, "/api/registros")
                                .hasRole("TRIPULACAO")
                        .requestMatchers("/api/registros/minha-embarcacao/**")
                                .hasRole("TRIPULACAO")
                        .requestMatchers("/api/registros/*/aprovar", "/api/registros/*/rejeitar")
                                .hasRole("GERENTE")
                        .requestMatchers("/api/registros/aprovados")
                                .hasAnyRole("DIRETORIA", "GERENTE")
                        .requestMatchers(HttpMethod.GET, "/api/registros")
                                .hasAnyRole("GERENTE", "DIRETORIA")

                        // Gestão de usuários: só GERENTE
                        .requestMatchers("/api/users/*/role", "/api/users/*/embarcacao")
                                .hasRole("GERENTE")
                        .requestMatchers(HttpMethod.GET, "/api/users")
                                .hasRole("GERENTE")

                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                        .xssProtection(xss -> xss.disable())
                        .contentSecurityPolicy(csp ->
                                csp.policyDirectives("default-src 'self'; frame-ancestors 'self'")
                        )
                        .referrerPolicy(ref ->
                                ref.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                        )
                )
                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
