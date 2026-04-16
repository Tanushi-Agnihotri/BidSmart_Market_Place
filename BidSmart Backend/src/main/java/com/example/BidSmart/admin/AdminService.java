package com.example.BidSmart.admin;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BidSmart.admin.dto.AdminUserResponse;
import com.example.BidSmart.admin.dto.ChartDataResponse;
import com.example.BidSmart.admin.dto.DashboardStatsResponse;
import java.math.BigDecimal;
import com.example.BidSmart.auction.AuctionImageRepository;
import com.example.BidSmart.auction.AuctionRepository;
import com.example.BidSmart.auction.AuctionStatus;
import com.example.BidSmart.bid.BidRepository;
import com.example.BidSmart.exception.ApiException;
import com.example.BidSmart.user.User;
import com.example.BidSmart.user.UserRepository;
import com.example.BidSmart.user.UserRole;
import com.example.BidSmart.user.UserStatus;
import com.example.BidSmart.watchlist.WatchlistRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final AuctionImageRepository auctionImageRepository;
    private final WatchlistRepository watchlistRepository;

    public AdminService(UserRepository userRepository, AuctionRepository auctionRepository, BidRepository bidRepository, AuctionImageRepository auctionImageRepository, WatchlistRepository watchlistRepository) {
        this.userRepository = userRepository;
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.auctionImageRepository = auctionImageRepository;
        this.watchlistRepository = watchlistRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalSellers = userRepository.countByRole(UserRole.SELLER);
        long totalBuyers = userRepository.countByRole(UserRole.BUYER);
        long totalAuctions = auctionRepository.count();
        long activeAuctions = auctionRepository.countByStatus(AuctionStatus.ACTIVE)
            + auctionRepository.countByStatus(AuctionStatus.ENDING_SOON);
        long closedAuctions = auctionRepository.countByStatus(AuctionStatus.CLOSED);
        long totalBids = bidRepository.count();
        var totalRevenue = auctionRepository.sumClosedAuctionRevenue();

        return new DashboardStatsResponse(
            totalUsers, totalSellers, totalBuyers,
            totalAuctions, activeAuctions, closedAuctions,
            totalBids, totalRevenue
        );
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(AdminUserResponse::from)
            .toList();
    }

    @Transactional
    public AdminUserResponse updateUserStatus(UUID userId, UserStatus newStatus) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() == UserRole.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot change admin status");
        }

        user.setStatus(newStatus);
        User saved = userRepository.save(user);
        return AdminUserResponse.from(saved);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() == UserRole.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot delete an admin account");
        }
        // Delete all auctions owned by this seller (cascade: bids, images, watchlist)
        List<UUID> auctionIds = auctionRepository.findBySellerId(userId)
            .stream().map(a -> a.getId()).toList();
        for (UUID aId : auctionIds) {
            bidRepository.deleteByAuctionId(aId);
            watchlistRepository.deleteByAuctionId(aId);
            auctionImageRepository.deleteByAuctionId(aId);
        }
        auctionRepository.deleteBySellerId(userId);
        // Delete bids placed by this user as a buyer
        bidRepository.deleteByBidderId(userId);
        // Delete watchlist entries
        watchlistRepository.deleteByUserId(userId);
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public ChartDataResponse getChartData() {
        // Monthly revenue (last 6 months)
        List<ChartDataResponse.MonthlyRevenue> monthlyRevenue = auctionRepository.getMonthlyRevenue()
            .stream()
            .map(row -> new ChartDataResponse.MonthlyRevenue(
                (String) row[0],
                new BigDecimal(row[1].toString())
            ))
            .toList();

        // Daily bids (last 7 days)
        List<ChartDataResponse.DailyBids> dailyBids = bidRepository.getDailyBidsLastWeek()
            .stream()
            .map(row -> new ChartDataResponse.DailyBids(
                (String) row[0],
                ((Number) row[1]).longValue()
            ))
            .toList();

        // Category breakdown (all active/ending-soon/closed auctions)
        List<ChartDataResponse.CategoryCount> categoryData = auctionRepository
            .countByCategory(List.of(
                com.example.BidSmart.auction.AuctionStatus.ACTIVE,
                com.example.BidSmart.auction.AuctionStatus.ENDING_SOON,
                com.example.BidSmart.auction.AuctionStatus.CLOSED
            ))
            .stream()
            .map(row -> new ChartDataResponse.CategoryCount(
                (String) row[0],
                ((Number) row[1]).longValue()
            ))
            .toList();

        return new ChartDataResponse(monthlyRevenue, dailyBids, categoryData);
    }

    @Transactional
    public void deleteAuction(UUID auctionId) {
        var auction = auctionRepository.findById(auctionId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Auction not found"));
        bidRepository.deleteByAuctionId(auctionId);
        watchlistRepository.deleteByAuctionId(auctionId);
        auctionImageRepository.deleteByAuctionId(auctionId);
        auctionRepository.delete(auction);
    }
}
