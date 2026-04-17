package com.example.BidSmart.user.dto;

import java.time.OffsetDateTime;

import com.example.BidSmart.user.BuyerProfile;
import com.example.BidSmart.user.IdDocumentType;
import com.example.BidSmart.user.VerificationStatus;

public record BuyerProfileStatusResponse(
    VerificationStatus status,
    String legalName,
    IdDocumentType idDocumentType,
    String idDocumentNumber,
    String idDocumentUrl,
    String rejectionReason,
    OffsetDateTime reviewedAt,
    OffsetDateTime createdAt
) {
    public static BuyerProfileStatusResponse from(BuyerProfile p) {
        return new BuyerProfileStatusResponse(
            p.getStatus(),
            p.getLegalName(),
            p.getIdDocumentType(),
            p.getIdDocumentNumber(),
            p.getIdDocumentUrl(),
            p.getRejectionReason(),
            p.getReviewedAt(),
            p.getCreatedAt()
        );
    }
}
