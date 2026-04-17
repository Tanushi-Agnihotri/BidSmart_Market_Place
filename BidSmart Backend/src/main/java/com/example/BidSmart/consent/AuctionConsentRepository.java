package com.example.BidSmart.consent;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuctionConsentRepository extends JpaRepository<AuctionConsent, UUID> {
    Optional<AuctionConsent> findByAuctionIdAndUserId(UUID auctionId, UUID userId);
    List<AuctionConsent> findByAuctionId(UUID auctionId);
    List<AuctionConsent> findByUserIdOrderBySignedAtDesc(UUID userId);
    boolean existsByAuctionIdAndUserId(UUID auctionId, UUID userId);
}
