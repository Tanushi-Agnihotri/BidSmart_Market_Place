package com.example.BidSmart.verification;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BidSmart.auction.Auction;
import com.example.BidSmart.auction.AuctionImageRepository;
import com.example.BidSmart.auction.AuctionRepository;
import com.example.BidSmart.user.VerificationStatus;

@Service
public class AutoVerificationService {

    private static final Set<String> SCAM_KEYWORDS = Set.of(
        "fake", "replica", "counterfeit", "stolen", "pirated", "knockoff", "knock-off",
        "imitation", "duplicate copy", "first copy", "1st copy", "master copy"
    );

    private static final BigDecimal MIN_PRICE = new BigDecimal("10");
    private static final BigDecimal MAX_PRICE = new BigDecimal("1000000000");

    private final AuctionRepository auctionRepository;
    private final AuctionImageRepository imageRepository;
    private final AuctionVerificationDocumentRepository docRepository;

    public AutoVerificationService(AuctionRepository auctionRepository,
                                   AuctionImageRepository imageRepository,
                                   AuctionVerificationDocumentRepository docRepository) {
        this.auctionRepository = auctionRepository;
        this.imageRepository = imageRepository;
        this.docRepository = docRepository;
    }

    public record Result(VerificationStatus status, String reason) {}

    @Transactional
    public Result evaluate(Auction auction) {
        String title = safe(auction.getTitle()).toLowerCase();
        String description = safe(auction.getDescription()).toLowerCase();
        BigDecimal basePrice = auction.getBasePrice();

        // Hard reject: scam keywords in title/description
        for (String kw : SCAM_KEYWORDS) {
            if (title.contains(kw) || description.contains(kw)) {
                return reject(auction, "Listing contains prohibited keywords (e.g. '" + kw + "'). Genuine products only.");
            }
        }

        // Hard reject: unreasonable price
        if (basePrice == null || basePrice.compareTo(MIN_PRICE) < 0 || basePrice.compareTo(MAX_PRICE) > 0) {
            return reject(auction, "Base price is outside the allowed range (₹10 – ₹1,000,000,000).");
        }

        // Hard reject: too-short title/description (bot-like or empty listings)
        if (title.length() < 5) {
            return reject(auction, "Title is too short (minimum 5 characters).");
        }
        if (description.length() < 20) {
            return reject(auction, "Description is too short (minimum 20 characters).");
        }

        // Automated system cannot verify the *content* of an uploaded document / image —
        // keep the listing PENDING so an admin can manually inspect authenticity.
        int imageCount = imageRepository.countByAuctionId(auction.getId());
        int docCount = docRepository.countByAuctionId(auction.getId());

        List<String> waiting = new java.util.ArrayList<>();
        if (imageCount == 0) waiting.add("product images");
        if (docCount == 0) waiting.add("verification documents");
        if (!waiting.isEmpty()) {
            return pending(auction, "Waiting for " + String.join(" and ", waiting) + " before admin review.");
        }
        return pending(auction, "Submitted for admin review — document authenticity must be verified manually.");
    }

    private Result reject(Auction a, String reason) {
        a.setVerificationStatus(VerificationStatus.REJECTED);
        a.setVerificationReason(reason);
        a.setVerifiedAt(OffsetDateTime.now());
        a.setVerifiedBy(null);
        auctionRepository.save(a);
        return new Result(VerificationStatus.REJECTED, reason);
    }

    private Result pending(Auction a, String reason) {
        a.setVerificationStatus(VerificationStatus.PENDING);
        a.setVerificationReason(reason);
        auctionRepository.save(a);
        return new Result(VerificationStatus.PENDING, reason);
    }

    private String safe(String s) { return s == null ? "" : s; }
}
