package com.example.BidSmart.user;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.BidSmart.exception.ApiException;
import com.example.BidSmart.user.dto.BecomeBuyerRequest;
import com.example.BidSmart.verification.DocumentStorageService;

@Service
public class BuyerProfileService {

    private final BuyerProfileRepository profileRepository;
    private final DocumentStorageService documentStorageService;

    public BuyerProfileService(BuyerProfileRepository profileRepository,
                               DocumentStorageService documentStorageService) {
        this.profileRepository = profileRepository;
        this.documentStorageService = documentStorageService;
    }

    @Transactional
    public BuyerProfile createProfile(User user, BecomeBuyerRequest request, MultipartFile idDocument) {
        BuyerProfile profile = profileRepository.findByUserId(user.getId())
            .map(existing -> {
                if (existing.getStatus() != VerificationStatus.REJECTED) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Buyer verification already submitted");
                }
                return existing;
            })
            .orElseGet(BuyerProfile::new);

        String url;
        try {
            url = documentStorageService.store(idDocument);
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        profile.setUser(user);
        profile.setLegalName(request.legalName().trim());
        profile.setIdDocumentType(request.idDocumentType());
        profile.setIdDocumentNumber(request.idDocumentNumber().trim());
        profile.setIdDocumentUrl(url);
        profile.setStatus(VerificationStatus.PENDING);
        profile.setRejectionReason(null);
        profile.setReviewedAt(null);
        profile.setReviewedBy(null);
        return profileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public BuyerProfile getProfile(User user) {
        return profileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Buyer profile not found"));
    }

    @Transactional(readOnly = true)
    public boolean isVerified(User user) {
        return profileRepository.existsByUserIdAndStatus(user.getId(), VerificationStatus.VERIFIED);
    }
}
