package com.example.BidSmart.user.dto;

import com.example.BidSmart.user.IdDocumentType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BecomeBuyerRequest(
    @NotBlank @Size(min = 2, max = 100) String legalName,
    @NotNull IdDocumentType idDocumentType,
    @NotBlank @Size(min = 4, max = 50) String idDocumentNumber
) {}
