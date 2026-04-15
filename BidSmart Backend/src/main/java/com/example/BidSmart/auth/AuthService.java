package com.example.BidSmart.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BidSmart.auth.dto.AuthResponse;
import com.example.BidSmart.auth.dto.AuthUserResponse;
import com.example.BidSmart.auth.dto.ForgotPasswordRequest;
import com.example.BidSmart.auth.dto.GoogleLoginRequest;
import com.example.BidSmart.auth.dto.LoginRequest;
import com.example.BidSmart.auth.dto.ResetPasswordRequest;
import com.example.BidSmart.auth.dto.SignupRequest;
import com.example.BidSmart.auth.dto.SignupResponse;
import com.example.BidSmart.exception.ApiException;
import com.example.BidSmart.security.JwtService;
import com.example.BidSmart.user.User;
import com.example.BidSmart.user.UserRepository;
import com.example.BidSmart.user.UserRole;
import com.example.BidSmart.user.UserStatus;

@Service
public class AuthService {

    private static final int RESET_TOKEN_TTL_MINUTES = 30;
    private static final int RESET_TOKEN_BYTES = 32;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleTokenVerifierService googleTokenVerifier;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final String frontendBaseUrl;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       GoogleTokenVerifierService googleTokenVerifier,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       EmailService emailService,
                       @Value("${app.frontend-url:http://localhost:8080}") String frontendBaseUrl) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleTokenVerifier = googleTokenVerifier;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
        this.frontendBaseUrl = frontendBaseUrl.replaceAll("/+$", "");
    }

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }

        if (request.role() == UserRole.ADMIN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Admin signup is not allowed");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);
        return SignupResponse.from(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.getPasswordHash() == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED,
                "This account uses Google Sign-In. Please continue with Google.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account is not active");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, "Bearer", AuthUserResponse.from(user));
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleTokenVerifierService.GoogleUserInfo info = googleTokenVerifier.verify(request.credential());

        if (info.email_verified() == null || !info.email_verified()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
        }

        String googleSub = info.sub();
        String email = normalizeEmail(info.email());
        String fullName = info.name();
        if (fullName == null || fullName.isBlank()) {
            fullName = email.split("@")[0];
        }

        User user = userRepository.findByGoogleSub(googleSub)
            .or(() -> userRepository.findByEmailIgnoreCase(email))
            .orElseGet(User::new);

        boolean isNew = user.getId() == null;
        if (isNew) {
            user.setEmail(email);
            user.setFullName(fullName);
            user.setRole(UserRole.BUYER);
            user.setStatus(UserStatus.ACTIVE);
        }

        if (user.getGoogleSub() == null) {
            user.setGoogleSub(googleSub);
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account is not active");
        }

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);
        return new AuthResponse(token, "Bearer", AuthUserResponse.from(savedUser));
    }

    /**
     * Starts a password reset. Always returns silently (no "email not found" leak).
     * If the user exists and has a password, a reset token is created and emailed.
     */
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();

        // Google-only accounts don't have a password to reset
        if (user.getPasswordHash() == null) {
            return;
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            return;
        }

        // Invalidate any previous tokens for this user — only one active reset at a time
        passwordResetTokenRepository.deleteAllByUserId(user.getId());
        passwordResetTokenRepository.flush();

        String rawToken = generateRawToken();
        String tokenHash = hashToken(rawToken);

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash(tokenHash);
        token.setExpiresAt(OffsetDateTime.now().plusMinutes(RESET_TOKEN_TTL_MINUTES));
        passwordResetTokenRepository.save(token);

        String resetLink = frontendBaseUrl + "/reset-password?token=" + rawToken;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.token());
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired reset link"));

        if (token.getUsedAt() != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This reset link has already been used");
        }

        if (token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This reset link has expired. Please request a new one.");
        }

        User user = token.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account is not active");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        token.setUsedAt(OffsetDateTime.now());
        passwordResetTokenRepository.save(token);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[RESET_TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }
}
