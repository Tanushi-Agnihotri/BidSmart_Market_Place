package com.example.BidSmart.auction;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.example.BidSmart.user.VerificationStatus;

public interface AuctionRepository extends JpaRepository<Auction, UUID>, JpaSpecificationExecutor<Auction> {

    List<Auction> findByVerificationStatusOrderByCreatedAtAsc(VerificationStatus verificationStatus);
    long countByVerificationStatus(VerificationStatus verificationStatus);

    List<Auction> findBySellerIdOrderByCreatedAtDesc(UUID sellerId);

    List<Auction> findByStatusOrderByEndTimeAsc(AuctionStatus status);

    List<Auction> findByStatusInOrderByEndTimeAsc(List<AuctionStatus> statuses);

    List<Auction> findByCategoryAndStatusInOrderByEndTimeAsc(String category, List<AuctionStatus> statuses);

    long countByStatus(AuctionStatus status);

    @Query("SELECT a.category, COUNT(a) FROM Auction a WHERE a.status IN :statuses GROUP BY a.category")
    List<Object[]> countByCategory(List<AuctionStatus> statuses);

    @Query("SELECT COALESCE(SUM(a.currentBid), 0) FROM Auction a WHERE a.status = 'CLOSED' AND a.currentBid > 0")
    BigDecimal sumClosedAuctionRevenue();

    @Query(value = """
        SELECT TO_CHAR(DATE_TRUNC('month', end_time), 'Mon') AS month,
               COALESCE(SUM(current_bid), 0) AS revenue
        FROM auctions
        WHERE status = 'CLOSED'
          AND current_bid > 0
          AND end_time >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', end_time)
        ORDER BY DATE_TRUNC('month', end_time)
        """, nativeQuery = true)
    List<Object[]> getMonthlyRevenue();

    // For scheduler: find auctions that need status updates
    List<Auction> findByStatusAndEndTimeBefore(AuctionStatus status, OffsetDateTime time);

    List<Auction> findByStatusAndStartTimeBefore(AuctionStatus status, OffsetDateTime time);

    List<Auction> findByStatusAndEndTimeBetween(AuctionStatus status, OffsetDateTime from, OffsetDateTime to);

    List<Auction> findBySellerId(UUID sellerId);
    void deleteBySellerId(UUID sellerId);
}
