package com.example.BidSmart.consent;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BidSmart.auction.Auction;
import com.example.BidSmart.auction.AuctionRepository;
import com.example.BidSmart.consent.dto.ConsentResponse;
import com.example.BidSmart.consent.dto.ConsentStatusResponse;
import com.example.BidSmart.consent.dto.SignConsentRequest;
import com.example.BidSmart.exception.ApiException;
import com.example.BidSmart.user.User;

@Service
public class ConsentService {

    private final AuctionConsentRepository consentRepository;
    private final AuctionRepository auctionRepository;

    public ConsentService(AuctionConsentRepository consentRepository, AuctionRepository auctionRepository) {
        this.consentRepository = consentRepository;
        this.auctionRepository = auctionRepository;
    }

    @Transactional
    public ConsentResponse signConsent(SignConsentRequest request, User user, String ip) {
        Auction auction = auctionRepository.findById(request.auctionId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Auction not found"));

        if (auction.getSeller().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Seller cannot sign consent on own auction");
        }

        if (!auction.isConsentRequired()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This auction does not require consent");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (auction.getConsentStartTime() != null && now.isBefore(auction.getConsentStartTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Consent window has not started yet");
        }
        if (auction.getConsentEndTime() != null && now.isAfter(auction.getConsentEndTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Consent window has closed");
        }

        if (consentRepository.existsByAuctionIdAndUserId(auction.getId(), user.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Consent already signed");
        }

        AuctionConsent consent = new AuctionConsent();
        consent.setAuction(auction);
        consent.setUser(user);
        consent.setSignatureName(request.signatureName().trim());
        consent.setSignatureData(request.signatureData());
        consent.setSignedAt(now);
        consent.setIpAddress(ip);
        consent.setDocumentPath("/api/consents/" + auction.getId() + "/" + user.getId() + "/document");

        AuctionConsent saved = consentRepository.save(consent);
        return ConsentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public ConsentStatusResponse getStatus(UUID auctionId, User user) {
        Auction auction = auctionRepository.findById(auctionId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Auction not found"));

        Optional<AuctionConsent> existing = consentRepository.findByAuctionIdAndUserId(auctionId, user.getId());
        OffsetDateTime now = OffsetDateTime.now();
        boolean windowOpen = auction.isConsentRequired()
            && (auction.getConsentStartTime() == null || !now.isBefore(auction.getConsentStartTime()))
            && (auction.getConsentEndTime() == null || !now.isAfter(auction.getConsentEndTime()));

        return new ConsentStatusResponse(
            auction.isConsentRequired(),
            existing.isPresent(),
            windowOpen,
            auction.getConsentStartTime(),
            auction.getConsentEndTime(),
            auction.getRulesAndRegulations(),
            existing.map(ConsentResponse::from).orElse(null)
        );
    }

    @Transactional(readOnly = true)
    public List<ConsentResponse> listByAuction(UUID auctionId, User requester) {
        Auction auction = auctionRepository.findById(auctionId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Auction not found"));
        if (!auction.getSeller().getId().equals(requester.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the seller can view consents");
        }
        return consentRepository.findByAuctionId(auctionId)
            .stream().map(ConsentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ConsentResponse> listMine(User user) {
        return consentRepository.findByUserIdOrderBySignedAtDesc(user.getId())
            .stream().map(ConsentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public boolean hasSignedConsent(UUID auctionId, UUID userId) {
        return consentRepository.existsByAuctionIdAndUserId(auctionId, userId);
    }
}
