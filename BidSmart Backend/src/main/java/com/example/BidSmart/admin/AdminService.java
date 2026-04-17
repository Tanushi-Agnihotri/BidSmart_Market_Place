package com.example.BidSmart.admin;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BidSmart.admin.dto.AdminSellerResponse;
import com.example.BidSmart.admin.dto.AdminUserResponse;
import com.example.BidSmart.admin.dto.ChartDataResponse;
import com.example.BidSmart.admin.dto.DashboardStatsResponse;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import com.example.BidSmart.auction.Auction;
import com.example.BidSmart.auction.AuctionImage;
import com.example.BidSmart.auction.AuctionImageRepository;
import com.example.BidSmart.auction.AuctionRepository;
import com.example.BidSmart.auction.AuctionStatus;
import com.example.BidSmart.auction.dto.AuctionResponse;
import com.example.BidSmart.bid.BidRepository;
import com.example.BidSmart.exception.ApiException;
import com.example.BidSmart.notification.NotificationService;
import com.example.BidSmart.notification.NotificationType;
import com.example.BidSmart.user.SellerProfile;
import com.example.BidSmart.user.SellerProfileRepository;
import com.example.BidSmart.user.User;
import com.example.BidSmart.user.UserRepository;
import com.example.BidSmart.user.UserRole;
import com.example.BidSmart.user.UserStatus;
import com.example.BidSmart.user.VerificationStatus;
import com.example.BidSmart.watchlist.WatchlistRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final AuctionImageRepository auctionImageRepository;
    private final WatchlistRepository watchlistRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final NotificationService notificationService;

    public AdminService(UserRepository userRepository, AuctionRepository auctionRepository, BidRepository bidRepository, AuctionImageRepository auctionImageRepository, WatchlistRepository watchlistRepository, SellerProfileRepository sellerProfileRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.auctionImageRepository = auctionImageRepository;
        this.watchlistRepository = watchlistRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.notificationService = notificationService;
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
    public AdminUserResponse updateUserRole(UUID userId, UserRole newRole) {
        if (newRole == UserRole.ADMIN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot assign admin role");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() == UserRole.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot change admin role");
        }
        if (user.getRole() == newRole) {
            return AdminUserResponse.from(user);
        }

        UserRole previousRole = user.getRole();
        user.setRole(newRole);
        User saved = userRepository.save(user);

        if (previousRole == UserRole.SELLER && newRole == UserRole.BUYER) {
            sellerProfileRepository.findByUserId(userId).ifPresent(profile -> {
                profile.setStatus(VerificationStatus.REJECTED);
                profile.setRejectionReason("Seller role removed by admin");
                profile.setReviewedAt(OffsetDateTime.now());
                sellerProfileRepository.save(profile);
            });
            for (Auction a : auctionRepository.findBySellerId(userId)) {
                a.setVerificationStatus(VerificationStatus.REJECTED);
                a.setVerificationReason("Seller role removed by admin");
                a.setVerifiedAt(OffsetDateTime.now());
                auctionRepository.save(a);
            }
            notificationService.createNotification(
                saved,
                NotificationType.SYSTEM,
                "Seller access revoked",
                "Admin has reverted your account to buyer. Your listings are no longer visible."
            );
        }
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

    @Transactional(readOnly = true)
    public List<AdminSellerResponse> getSellers(VerificationStatus filter) {
        List<SellerProfile> profiles = filter != null
            ? sellerProfileRepository.findByStatusOrderByCreatedAtAsc(filter)
            : sellerProfileRepository.findAll();
        return profiles.stream().map(AdminSellerResponse::from).toList();
    }

    @Transactional
    public AdminSellerResponse verifySeller(UUID sellerProfileId, VerificationStatus decision, String reason, User admin) {
        if (decision != VerificationStatus.VERIFIED && decision != VerificationStatus.REJECTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Decision must be VERIFIED or REJECTED");
        }
        SellerProfile profile = sellerProfileRepository.findById(sellerProfileId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Seller profile not found"));

        profile.setStatus(decision);
        profile.setRejectionReason(decision == VerificationStatus.REJECTED ? reason : null);
        profile.setReviewedAt(OffsetDateTime.now());
        profile.setReviewedBy(admin.getId());
        SellerProfile saved = sellerProfileRepository.save(profile);

        User profileUser = saved.getUser();
        if (decision == VerificationStatus.VERIFIED && profileUser.getRole() != UserRole.ADMIN) {
            profileUser.setRole(UserRole.SELLER);
            userRepository.save(profileUser);
        }

        if (decision == VerificationStatus.VERIFIED) {
            notificationService.createNotification(
                saved.getUser(),
                NotificationType.SYSTEM,
                "Seller account verified",
                "Your seller profile has been approved. You can now create auctions."
            );
        } else {
            notificationService.createNotification(
                saved.getUser(),
                NotificationType.SYSTEM,
                "Seller application rejected",
                "Your seller application was rejected." + (reason != null && !reason.isBlank() ? " Reason: " + reason : "")
            );
        }
        return AdminSellerResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<AuctionResponse> getAuctionsByVerification(VerificationStatus filter) {
        List<Auction> auctions = filter != null
            ? auctionRepository.findByVerificationStatusOrderByCreatedAtAsc(filter)
            : auctionRepository.findAll();
        return auctions.stream()
            .map(a -> AuctionResponse.from(a, auctionImageRepository.findByAuctionIdOrderBySortOrder(a.getId())))
            .toList();
    }

    @Transactional
    public AuctionResponse verifyAuction(UUID auctionId, VerificationStatus decision, String reason, User admin) {
        if (decision != VerificationStatus.VERIFIED && decision != VerificationStatus.REJECTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Decision must be VERIFIED or REJECTED");
        }
        Auction auction = auctionRepository.findById(auctionId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Auction not found"));

        auction.setVerificationStatus(decision);
        auction.setVerificationReason(decision == VerificationStatus.REJECTED ? reason : null);
        auction.setVerifiedAt(OffsetDateTime.now());
        auction.setVerifiedBy(admin.getId());
        Auction saved = auctionRepository.save(auction);

        if (decision == VerificationStatus.VERIFIED) {
            notificationService.createNotification(
                saved.getSeller(),
                NotificationType.AUCTION,
                "Auction approved: " + saved.getTitle(),
                "Your auction is now live and visible to buyers."
            );
        } else {
            notificationService.createNotification(
                saved.getSeller(),
                NotificationType.AUCTION,
                "Auction rejected: " + saved.getTitle(),
                "Your auction was rejected." + (reason != null && !reason.isBlank() ? " Reason: " + reason : "")
            );
        }
        List<AuctionImage> images = auctionImageRepository.findByAuctionIdOrderBySortOrder(saved.getId());
        return AuctionResponse.from(saved, images);
    }
}
