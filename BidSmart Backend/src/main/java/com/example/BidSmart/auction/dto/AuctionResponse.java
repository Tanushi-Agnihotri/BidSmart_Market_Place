package com.example.BidSmart.auction.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import com.example.BidSmart.auction.Auction;
import com.example.BidSmart.auction.AuctionCondition;
import com.example.BidSmart.auction.AuctionImage;
import com.example.BidSmart.auction.AuctionStatus;
import com.example.BidSmart.user.VerificationStatus;

public record AuctionResponse(
    UUID id,
    String title,
    String category,
    String description,
    AuctionCondition condition,
    BigDecimal basePrice,
    BigDecimal currentBid,
    BigDecimal bidIncrement,
    int totalBids,
    int watchlistCount,
    OffsetDateTime startTime,
    OffsetDateTime endTime,
    AuctionStatus status,
    VerificationStatus verificationStatus,
    String verificationReason,
    UUID sellerId,
    String sellerName,
    OffsetDateTime createdAt,
    List<String> images
) {
    public static AuctionResponse from(Auction auction) {
        return from(auction, List.of());
    }

    public static AuctionResponse from(Auction auction, List<AuctionImage> auctionImages) {
        List<String> imageUrls = auctionImages.stream()
            .map(img -> {
                String fp = img.getFilePath();
                // Cloudinary images already have a full HTTPS URL
                return (fp != null && fp.startsWith("http")) ? fp : "/api/images/" + fp;
            })
            .toList();

        return new AuctionResponse(
            auction.getId(),
            auction.getTitle(),
            auction.getCategory(),
            auction.getDescription(),
            auction.getItemCondition(),
            auction.getBasePrice(),
            auction.getCurrentBid(),
            auction.getBidIncrement(),
            auction.getTotalBids(),
            auction.getWatchlistCount(),
            auction.getStartTime(),
            auction.getEndTime(),
            auction.getStatus(),
            auction.getVerificationStatus(),
            auction.getVerificationReason(),
            auction.getSeller().getId(),
            auction.getSeller().getFullName(),
            auction.getCreatedAt(),
            imageUrls
        );
    }
}
