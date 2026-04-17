package com.example.BidSmart.stats;

import java.math.BigDecimal;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.BidSmart.auction.AuctionRepository;
import com.example.BidSmart.bid.BidRepository;
import com.example.BidSmart.user.UserRepository;
import com.example.BidSmart.user.VerificationStatus;

@RestController
@RequestMapping("/api/stats")
public class PublicStatsController {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;

    public PublicStatsController(AuctionRepository auctionRepository, BidRepository bidRepository, UserRepository userRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public PublicStatsResponse getPublicStats() {
        long totalAuctions = auctionRepository.countByVerificationStatus(VerificationStatus.VERIFIED);
        long totalBids = bidRepository.count();
        long activeUsers = userRepository.count();
        BigDecimal totalRevenue = auctionRepository.sumClosedAuctionRevenue();

        return new PublicStatsResponse(totalAuctions, totalBids, activeUsers, totalRevenue);
    }
}
