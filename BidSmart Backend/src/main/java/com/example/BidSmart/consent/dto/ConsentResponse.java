package com.example.BidSmart.consent.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.example.BidSmart.consent.AuctionConsent;

public record ConsentResponse(
    UUID id,
    UUID auctionId,
    UUID userId,
    String userName,
    String userEmail,
    boolean userVerified,
    String signatureName,
    String signatureData,
    OffsetDateTime signedAt,
    String documentPath
) {
    public static ConsentResponse from(AuctionConsent c) {
        return new ConsentResponse(
            c.getId(),
            c.getAuction().getId(),
            c.getUser().getId(),
            c.getUser().getFullName(),
            c.getUser().getEmail(),
            true,
            c.getSignatureName(),
            c.getSignatureData(),
            c.getSignedAt(),
            c.getDocumentPath()
        );
    }
}
