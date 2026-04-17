package com.example.BidSmart.consent.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SignConsentRequest(
    @NotNull UUID auctionId,
    @NotBlank @Size(max = 200) String signatureName,
    String signatureData
) {}
