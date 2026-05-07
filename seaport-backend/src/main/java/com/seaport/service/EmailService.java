package com.seaport.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    public void sendPasswordResetEmail(String to, String name, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        String htmlBody = """
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px;
                                 box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
                    .header { background-color: #1B9BC4; padding: 32px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
                    .content { padding: 32px; color: #3D3D3D; }
                    .content p { line-height: 1.6; }
                    .btn { display: inline-block; padding: 14px 32px; background-color: #7DC242;
                           color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;
                           margin: 24px 0; }
                    .footer { background-color: #f4f4f4; padding: 16px 32px; text-align: center;
                              font-size: 12px; color: #888; }
                    .link-text { word-break: break-all; color: #1B9BC4; font-size: 13px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>Seaport Serviços Marítimos</h1>
                    </div>
                    <div class="content">
                      <p>Olá, <strong>%s</strong>!</p>
                      <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                      <p>Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong>30 minutos</strong>.</p>
                      <p style="text-align: center;">
                        <a href="%s" class="btn">Redefinir Senha</a>
                      </p>
                      <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
                      <p class="link-text">%s</p>
                      <p>Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá a mesma.</p>
                    </div>
                    <div class="footer">
                      <p>&copy; 2024 Seaport Serviços Marítimos. Todos os direitos reservados.</p>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(name, resetLink, resetLink);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Redefinição de Senha - Seaport");
            helper.setText(htmlBody, true);
            helper.setFrom("noreply@seaport.com.br");
            mailSender.send(message);
            log.info("Email de redefinição enviado para: {}", to);
        } catch (MessagingException e) {
            log.error("Falha ao enviar email para {}: {}", to, e.getMessage());
        }
    }
}
