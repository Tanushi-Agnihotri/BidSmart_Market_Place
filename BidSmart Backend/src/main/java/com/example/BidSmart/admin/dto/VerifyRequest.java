package com.example.BidSmart.admin.dto;

import com.example.BidSmart.user.VerificationStatus;

import jakarta.validation.constraints.NotNull;

public record VerifyRequest(
    @NotNull(message = "Decision is required")
    VerificationStatus decision,
    String reason
) {
}
