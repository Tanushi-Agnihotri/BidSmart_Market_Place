package com.example.BidSmart.bid;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BidRepository extends JpaRepository<Bid, UUID> {

    @org.springframework.data.jpa.repository.Query(value = """
        SELECT TO_CHAR(DATE_TRUNC('day', created_at), 'Dy') AS day,
               COUNT(*) AS bids
        FROM bids
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY DATE_TRUNC('day', created_at)
        """, nativeQuery = true)
    List<Object[]> getDailyBidsLastWeek();

    List<Bid> findByAuctionIdOrderByAmountDesc(UUID auctionId);

    List<Bid> findByBidderIdOrderByCreatedAtDesc(UUID bidderId);

    int countByAuctionId(UUID auctionId);

    void deleteByAuctionId(UUID auctionId);

    void deleteByBidderId(UUID bidderId);
}
