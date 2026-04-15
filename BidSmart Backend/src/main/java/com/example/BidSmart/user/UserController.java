package com.example.BidSmart.user;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.BidSmart.auth.dto.AuthUserResponse;
import com.example.BidSmart.exception.ApiException;
import com.example.BidSmart.user.dto.ChangePasswordRequest;
import com.example.BidSmart.user.dto.NotificationPrefsRequest;
import com.example.BidSmart.user.dto.NotificationPrefsResponse;
import com.example.BidSmart.user.dto.UpdateProfileRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<AuthUserResponse> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(AuthUserResponse.from(user));
    }

    @PatchMapping
    public ResponseEntity<AuthUserResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {

        User user = (User) authentication.getPrincipal();

        String newEmail = request.email().trim().toLowerCase(Locale.ROOT);
        if (!newEmail.equals(user.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(newEmail)) {
                throw new ApiException(HttpStatus.CONFLICT, "Email is already in use");
            }
            user.setEmail(newEmail);
        }

        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone() != null ? request.phone().trim() : null);
        user.setBio(request.bio() != null ? request.bio().trim() : null);
        user.setLocation(request.location() != null ? request.location().trim() : null);

        User saved = userRepository.save(user);
        return ResponseEntity.ok(AuthUserResponse.from(saved));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        User user = (User) authentication.getPrincipal();

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/notification-preferences")
    public ResponseEntity<NotificationPrefsResponse> getNotificationPreferences(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(NotificationPrefsResponse.from(user));
    }

    @PatchMapping("/notification-preferences")
    public ResponseEntity<NotificationPrefsResponse> updateNotificationPreferences(
            Authentication authentication,
            @RequestBody NotificationPrefsRequest request) {

        User user = (User) authentication.getPrincipal();

        if (request.emailBids() != null) user.setNotifEmailBids(request.emailBids());
        if (request.emailAuctions() != null) user.setNotifEmailAuctions(request.emailAuctions());
        if (request.emailNewsletter() != null) user.setNotifEmailNewsletter(request.emailNewsletter());
        if (request.pushBids() != null) user.setNotifPushBids(request.pushBids());
        if (request.pushEnding() != null) user.setNotifPushEnding(request.pushEnding());

        User saved = userRepository.save(user);
        return ResponseEntity.ok(NotificationPrefsResponse.from(saved));
    }
}
