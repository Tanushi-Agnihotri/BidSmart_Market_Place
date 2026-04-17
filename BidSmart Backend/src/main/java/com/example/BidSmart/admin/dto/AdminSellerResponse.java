package com.example.BidSmart.admin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.BidSmart.user.SellerProfile;
import com.example.BidSmart.user.VerificationStatus;

public record AdminSellerResponse(
    UUID id,
    UUID userId,
    String userFullName,
    String userEmail,
    String storeName,
    String businessCategory,
    String description,
    String legalName,
    String idDocumentUrl,
    VerificationStatus status,
    String rejectionReason,
    OffsetDateTime reviewedAt,
    OffsetDateTime createdAt
) {
    public static AdminSellerResponse from(SellerProfile p) {
        String docUrl = p.getIdDocumentUrl();
        String resolvedUrl = (docUrl != null && docUrl.startsWith("http")) ? docUrl : "/api/images/" + docUrl;
        return new AdminSellerResponse(
            p.getId(),
            p.getUser().getId(),
            p.getUser().getFullName(),
            p.getUser().getEmail(),
            p.getStoreName(),
            p.getBusinessCategory(),
            p.getDescription(),
            p.getLegalName(),
            resolvedUrl,
            p.getStatus(),
            p.getRejectionReason(),
            p.getReviewedAt(),
            p.getCreatedAt()
        );
    }
}
