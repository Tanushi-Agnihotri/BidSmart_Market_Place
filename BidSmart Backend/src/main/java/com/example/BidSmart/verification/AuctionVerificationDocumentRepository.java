package com.example.BidSmart.verification;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuctionVerificationDocumentRepository extends JpaRepository<AuctionVerificationDocument, UUID> {
    List<AuctionVerificationDocument> findByAuctionIdOrderByUploadedAtAsc(UUID auctionId);
    int countByAuctionId(UUID auctionId);

    @Modifying
    @Query("delete from AuctionVerificationDocument d where d.auction.id = :auctionId")
    void deleteByAuctionId(@Param("auctionId") UUID auctionId);
}
