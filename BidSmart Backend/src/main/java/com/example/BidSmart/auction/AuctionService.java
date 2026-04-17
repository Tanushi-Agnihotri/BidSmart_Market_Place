package com.example.BidSmart.auction;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BidSmart.auction.dto.AuctionResponse;
import com.example.BidSmart.auction.dto.CreateAuctionRequest;
import com.example.BidSmart.auction.dto.UpdateAuctionRequest;
import com.example.BidSmart.exception.ApiException;
import com.example.BidSmart.user.SellerProfileRepository;
import com.example.BidSmart.user.User;
import com.example.BidSmart.user.UserRole;
import com.example.BidSmart.user.VerificationStatus;

import com.example.BidSmart.verification.AuctionVerificationDocumentRepository;
import com.example.BidSmart.watchlist.WatchlistRepository;

@Service
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final AuctionImageRepository imageRepository;
    private final WatchlistRepository watchlistRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final AuctionVerificationDocumentRepository verificationDocRepository;

    public AuctionService(AuctionRepository auctionRepository, AuctionImageRepository imageRepository, WatchlistRepository watchlistRepository, SellerProfileRepository sellerProfileRepository, AuctionVerificationDocumentRepository verificationDocRepository) {
        this.auctionRepository = auctionRepository;
        this.imageRepository = imageRepository;
        this.watchlistRepository = watchlistRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.verificationDocRepository = verificationDocRepository;
    }

    @Transactional(readOnly = true)
    public List<AuctionResponse> getAllAuctions(String category, String status) {
        List<Auction> auctions;

        if (category != null && !category.isBlank() && status != null && !status.isBlank()) {
            List<AuctionStatus> statuses = parseStatuses(status);
            auctions = auctionRepository.findByCategoryAndStatusInOrderByEndTimeAsc(category, statuses);
        } else if (status != null && !status.isBlank()) {
            List<AuctionStatus> statuses = parseStatuses(status);
            auctions = auctionRepository.findByStatusInOrderByEndTimeAsc(statuses);
        } else {
            auctions = auctionRepository.findByStatusInOrderByEndTimeAsc(
                List.of(AuctionStatus.ACTIVE, AuctionStatus.ENDING_SOON, AuctionStatus.UPCOMING, AuctionStatus.CLOSED)
            );
        }

        return auctions.stream()
            .filter(a -> a.getVerificationStatus() == VerificationStatus.VERIFIED)
            .map(this::toResponseWithImages)
            .toList();
    }

    @Transactional(readOnly = true)
    public AuctionResponse getAuctionById(UUID id) {
        Auction auction = findAuctionOrThrow(id);
        if (auction.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Auction not found");
        }
        return toResponseWithImages(auction);
    }

    @Transactional(readOnly = true)
    public List<AuctionResponse> getAuctionsBySeller(UUID sellerId) {
        return auctionRepository.findBySellerIdOrderByCreatedAtDesc(sellerId)
            .stream()
            .map(this::toResponseWithImages)
            .toList();
    }

    @Transactional
    public AuctionResponse createAuction(CreateAuctionRequest request, User seller) {
        if (seller.getRole() != UserRole.SELLER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only sellers can create auctions");
        }

        VerificationStatus sellerStatus = sellerProfileRepository.findByUserId(seller.getId())
            .map(p -> p.getStatus())
            .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "Seller profile not found"));
        if (sellerStatus != VerificationStatus.VERIFIED) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your seller account is not verified yet");
        }

        OffsetDateTime now = OffsetDateTime.now();
        boolean consentRequired = Boolean.TRUE.equals(request.consentRequired());

        if (consentRequired) {
            if (request.consentStartTime() == null || request.consentEndTime() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Consent window is required when consent is enabled");
            }
            if (!request.consentEndTime().isAfter(request.consentStartTime())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Consent end must be after consent start");
            }
        }

        if (request.durationHours() < 1 || request.durationHours() > 24) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Auction duration must be between 1 and 24 hours");
        }
        OffsetDateTime auctionStart = now;
        OffsetDateTime endTime = auctionStart.plusHours(request.durationHours());

        Auction auction = new Auction();
        auction.setTitle(request.title().trim());
        auction.setCategory(request.category().trim());
        auction.setDescription(request.description() != null ? request.description().trim() : null);
        auction.setItemCondition(request.condition());
        auction.setBasePrice(request.basePrice());
        auction.setBidIncrement(request.bidIncrement());
        auction.setStartTime(auctionStart);
        auction.setEndTime(endTime);
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setVerificationStatus(VerificationStatus.PENDING);
        auction.setSeller(seller);
        auction.setRulesAndRegulations(request.rulesAndRegulations());
        auction.setConsentRequired(consentRequired);
        auction.setConsentStartTime(request.consentStartTime());
        auction.setConsentEndTime(request.consentEndTime());

        Auction saved = auctionRepository.save(auction);
        return toResponseWithImages(saved);
    }

    @Transactional
    public AuctionResponse updateAuction(UUID auctionId, UpdateAuctionRequest request, User seller) {
        Auction auction = findAuctionOrThrow(auctionId);

        if (!auction.getSeller().getId().equals(seller.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only edit your own auctions");
        }

        if (auction.getStatus() == AuctionStatus.CLOSED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot edit a closed auction");
        }

        if (auction.getVerificationStatus() == VerificationStatus.VERIFIED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot edit a verified auction — admin has already approved it");
        }

        if (auction.getTotalBids() > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot edit an auction that already has bids");
        }

        if (request.title() != null) auction.setTitle(request.title().trim());
        if (request.category() != null) auction.setCategory(request.category().trim());
        if (request.description() != null) auction.setDescription(request.description().trim());
        if (request.condition() != null) auction.setItemCondition(request.condition());
        if (request.basePrice() != null) auction.setBasePrice(request.basePrice());
        if (request.bidIncrement() != null) auction.setBidIncrement(request.bidIncrement());
        if (request.rulesAndRegulations() != null) auction.setRulesAndRegulations(request.rulesAndRegulations());
        if (request.consentRequired() != null) auction.setConsentRequired(request.consentRequired());
        if (request.consentStartTime() != null) auction.setConsentStartTime(request.consentStartTime());
        if (request.consentEndTime() != null) auction.setConsentEndTime(request.consentEndTime());

        Auction saved = auctionRepository.save(auction);
        return toResponseWithImages(saved);
    }

    @Transactional
    public void deleteAuction(UUID auctionId, User seller) {
        Auction auction = findAuctionOrThrow(auctionId);

        if (!auction.getSeller().getId().equals(seller.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only delete your own auctions");
        }

        if (auction.getTotalBids() > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot delete an auction that has bids");
        }

        watchlistRepository.deleteByAuctionId(auctionId);
        imageRepository.deleteByAuctionId(auctionId);
        verificationDocRepository.deleteByAuctionId(auctionId);
        auctionRepository.delete(auction);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getCategoryCounts() {
        List<Object[]> results = auctionRepository.countByCategory(
            List.of(AuctionStatus.ACTIVE, AuctionStatus.ENDING_SOON, AuctionStatus.UPCOMING, AuctionStatus.CLOSED)
        );
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Object[] row : results) {
            counts.put((String) row[0], (Long) row[1]);
        }
        return counts;
    }

    private Auction findAuctionOrThrow(UUID id) {
        return auctionRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Auction not found"));
    }

    private AuctionResponse toResponseWithImages(Auction auction) {
        List<AuctionImage> images = imageRepository.findByAuctionIdOrderBySortOrder(auction.getId());
        return AuctionResponse.from(auction, images);
    }

    private List<AuctionStatus> parseStatuses(String status) {
        try {
            return List.of(AuctionStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status: " + status);
        }
    }
}
