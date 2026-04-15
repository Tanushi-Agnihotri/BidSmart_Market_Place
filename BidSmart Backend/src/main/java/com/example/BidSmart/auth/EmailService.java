package com.example.BidSmart.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender,
                        @Value("${app.mail.from:no-reply@bidsmart.local}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    /**
     * Sends a password reset email. If SMTP is not configured (no JavaMailSender bean),
     * the reset link is logged to stdout so developers can still test the flow locally.
     */
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetLink) {
        String subject = "Reset your BidSmart password";
        String body = buildBody(fullName, resetLink);

        if (mailSender == null) {
            log.warn("=== SMTP not configured — password reset link for {} ===", toEmail);
            log.warn("{}", resetLink);
            log.warn("=== Configure spring.mail.* to send real emails ===");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Password reset email sent to {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send password reset email to {}: {}", toEmail, ex.getMessage());
            log.warn("Fallback — reset link for {}: {}", toEmail, resetLink);
        }
    }

    private String buildBody(String fullName, String resetLink) {
        String greeting = (fullName == null || fullName.isBlank()) ? "Hi," : "Hi " + fullName + ",";
        return greeting + "\n\n"
            + "We received a request to reset the password for your BidSmart account.\n\n"
            + "Click the link below to choose a new password. The link expires in 30 minutes.\n\n"
            + resetLink + "\n\n"
            + "If you didn't request this, you can safely ignore this email — your password will not change.\n\n"
            + "— BidSmart\n";
    }
}
