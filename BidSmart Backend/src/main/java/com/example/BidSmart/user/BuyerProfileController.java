package com.example.BidSmart.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.BidSmart.user.dto.BecomeBuyerRequest;
import com.example.BidSmart.user.dto.BuyerProfileStatusResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users/me/buyer-profile")
public class BuyerProfileController {

    private final BuyerProfileService profileService;

    public BuyerProfileController(BuyerProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping
    public ResponseEntity<BuyerProfileStatusResponse> becomeBuyer(
            @Valid @RequestPart("data") BecomeBuyerRequest request,
            @RequestPart("idDocument") MultipartFile idDocument,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        BuyerProfile profile = profileService.createProfile(user, request, idDocument);
        return ResponseEntity.status(HttpStatus.CREATED).body(BuyerProfileStatusResponse.from(profile));
    }

    @GetMapping
    public ResponseEntity<BuyerProfileStatusResponse> getMyProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(BuyerProfileStatusResponse.from(profileService.getProfile(user)));
    }
}
