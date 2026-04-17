package com.example.BidSmart.consent;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import com.example.BidSmart.auction.Auction;
import com.example.BidSmart.auction.AuctionRepository;
import com.example.BidSmart.consent.dto.ConsentResponse;
import com.example.BidSmart.consent.dto.ConsentStatusResponse;
import com.example.BidSmart.consent.dto.SignConsentRequest;
import com.example.BidSmart.exception.ApiException;
import com.example.BidSmart.user.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/consents")
public class ConsentController {

    private final ConsentService consentService;
    private final AuctionConsentRepository consentRepository;
    private final AuctionRepository auctionRepository;

    public ConsentController(ConsentService consentService,
                             AuctionConsentRepository consentRepository,
                             AuctionRepository auctionRepository) {
        this.consentService = consentService;
        this.consentRepository = consentRepository;
        this.auctionRepository = auctionRepository;
    }

    @PostMapping
    public ResponseEntity<ConsentResponse> sign(@Valid @RequestBody SignConsentRequest request,
                                                Authentication auth,
                                                HttpServletRequest http) {
        User user = (User) auth.getPrincipal();
        String ip = http.getRemoteAddr();
        ConsentResponse resp = consentService.signConsent(request, user, ip);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @GetMapping("/auction/{auctionId}/status")
    public ResponseEntity<ConsentStatusResponse> status(@PathVariable UUID auctionId, Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(consentService.getStatus(auctionId, user));
    }

    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<ConsentResponse>> listByAuction(@PathVariable UUID auctionId, Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(consentService.listByAuction(auctionId, user));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ConsentResponse>> my(Authentication auth) {
        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(consentService.listMine(user));
    }

    @Transactional(readOnly = true)
    @GetMapping(value = "/{auctionId}/{userId}/document", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> document(@PathVariable UUID auctionId,
                                           @PathVariable UUID userId,
                                           Authentication auth) {
        User requester = (User) auth.getPrincipal();
        Auction auction = auctionRepository.findById(auctionId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Auction not found"));
        AuctionConsent consent = consentRepository.findByAuctionIdAndUserId(auctionId, userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Consent not found"));

        boolean isBuyer = consent.getUser().getId().equals(requester.getId());
        boolean isSeller = auction.getSeller().getId().equals(requester.getId());
        if (!isBuyer && !isSeller) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to view this document");
        }

        String html = renderConsentHtml(auction, consent);
        return ResponseEntity.ok(html);
    }

    private String renderConsentHtml(Auction auction, AuctionConsent consent) {
        String rules = auction.getRulesAndRegulations() == null ? "" : auction.getRulesAndRegulations();
        return "<!doctype html><html><head><meta charset=\"utf-8\"/><title>Consent Document</title>"
            + "<style>body{font-family:Georgia,serif;max-width:780px;margin:40px auto;padding:24px;color:#222;}"
            + "h1{border-bottom:2px solid #c9a24b;padding-bottom:8px;} .meta{background:#faf6eb;padding:16px;border-radius:8px;}"
            + ".sig{margin-top:32px;padding-top:16px;border-top:1px dashed #999;} pre{white-space:pre-wrap;}</style></head><body>"
            + "<h1>BidSmart \u2013 Auction Consent</h1>"
            + "<div class=\"meta\">"
            + "<p><b>Auction:</b> " + escape(auction.getTitle()) + "</p>"
            + "<p><b>Auction ID:</b> " + auction.getId() + "</p>"
            + "<p><b>Buyer:</b> " + escape(consent.getUser().getFullName()) + " (" + escape(consent.getUser().getEmail()) + ")</p>"
            + "<p><b>Buyer ID:</b> " + consent.getUser().getId() + "</p>"
            + "<p><b>Signed At:</b> " + consent.getSignedAt() + "</p>"
            + "</div>"
            + "<h2>Rules &amp; Regulations</h2><pre>" + escape(rules) + "</pre>"
            + "<div class=\"sig\"><p><b>Signature:</b> " + escape(consent.getSignatureName()) + "</p>"
            + "<p style=\"font-size:12px;color:#666;\">IP: " + escape(consent.getIpAddress()) + "</p></div>"
            + "</body></html>";
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
