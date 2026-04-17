package com.example.BidSmart.admin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.BidSmart.user.BuyerProfile;
import com.example.BidSmart.user.IdDocumentType;
import com.example.BidSmart.user.VerificationStatus;

public record AdminBuyerResponse(
    UUID id,
    UUID userId,
    String userFullName,
    String userEmail,
    String legalName,
    IdDocumentType idDocumentType,
    String idDocumentNumber,
    String idDocumentUrl,
    VerificationStatus status,
    String rejectionReason,
    OffsetDateTime reviewedAt,
    OffsetDateTime createdAt
) {
    public static AdminBuyerResponse from(BuyerProfile p) {
        String docUrl = p.getIdDocumentUrl();
        String resolvedUrl = (docUrl != null && docUrl.startsWith("http")) ? docUrl : "/api/images/" + docUrl;
        return new AdminBuyerResponse(
            p.getId(),
            p.getUser().getId(),
            p.getUser().getFullName(),
            p.getUser().getEmail(),
            p.getLegalName(),
            p.getIdDocumentType(),
            p.getIdDocumentNumber(),
            resolvedUrl,
            p.getStatus(),
            p.getRejectionReason(),
            p.getReviewedAt(),
            p.getCreatedAt()
        );
    }
}
