package com.example.BidSmart.user.dto;

import java.time.OffsetDateTime;

import com.example.BidSmart.user.SellerProfile;
import com.example.BidSmart.user.VerificationStatus;

public record SellerProfileStatusResponse(
    VerificationStatus status,
    String rejectionReason,
    OffsetDateTime reviewedAt,
    OffsetDateTime createdAt,
    String storeName
) {
    public static SellerProfileStatusResponse from(SellerProfile p) {
        return new SellerProfileStatusResponse(
            p.getStatus(),
            p.getRejectionReason(),
            p.getReviewedAt(),
            p.getCreatedAt(),
            p.getStoreName()
        );
    }
}
