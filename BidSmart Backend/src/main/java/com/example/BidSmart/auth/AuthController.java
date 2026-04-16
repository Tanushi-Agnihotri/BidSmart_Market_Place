package com.example.BidSmart.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.BidSmart.auth.dto.AuthResponse;
import com.example.BidSmart.auth.dto.AuthUserResponse;
import com.example.BidSmart.auth.dto.ForgotPasswordRequest;
import com.example.BidSmart.auth.dto.GoogleLoginRequest;
import com.example.BidSmart.auth.dto.LoginRequest;
import com.example.BidSmart.auth.dto.ResetPasswordRequest;
import com.example.BidSmart.auth.dto.SignupRequest;
import com.example.BidSmart.auth.dto.SignupResponse;
import com.example.BidSmart.user.User;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Value("${app.admin-setup-key:}")
    private String adminSetupKey;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        SignupResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        // Always 204 so we don't leak whether the email exists
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> me(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(AuthUserResponse.from(user));
    }

    /**
     * One-time endpoint to promote a user to ADMIN role.
     * Requires X-Setup-Key header matching ADMIN_SETUP_KEY env var.
     * Disable after use by removing the env var.
     */
    @PostMapping("/make-admin")
    public ResponseEntity<String> makeAdmin(
            @RequestHeader("X-Setup-Key") String setupKey,
            @RequestBody java.util.Map<String, String> body) {
        if (adminSetupKey.isBlank() || !adminSetupKey.equals(setupKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid setup key");
        }
        String email = body.get("email");
        authService.promoteToAdmin(email);
        return ResponseEntity.ok("User " + email + " promoted to ADMIN");
    }
}
