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
        String signedAt = consent.getSignedAt() == null ? "" :
            consent.getSignedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd MMMM yyyy 'at' hh:mm a"));
        String signedDateShort = consent.getSignedAt() == null ? "" :
            consent.getSignedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy"));
        String sellerName = auction.getSeller() == null ? "" : escape(auction.getSeller().getFullName());
        String docNumber = "BSC-" + auction.getId().toString().substring(0, 8).toUpperCase();

        return "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"/>"
            + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>"
            + "<title>Auction Consent \u2013 " + escape(auction.getTitle()) + "</title>"
            + "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">"
            + "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>"
            + "<link href=\"https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Dancing+Script:wght@600;700&display=swap\" rel=\"stylesheet\">"
            + "<style>"
            + "*,*::before,*::after{box-sizing:border-box;}"
            + "body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:radial-gradient(ellipse at top,#efe4c6 0%,#e8dab2 40%,#d9c389 100%);background-attachment:fixed;margin:0;padding:48px 16px;color:#2a2014;line-height:1.65;min-height:100vh;}"
            + ".page{max-width:860px;margin:0 auto;background:#fffdf6;border-radius:4px;box-shadow:0 30px 60px -20px rgba(60,40,10,0.35),0 0 0 1px rgba(180,140,60,0.12);overflow:hidden;position:relative;}"
            + ".page::before{content:'';position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(90deg,#8a6522 0%,#d4a94a 25%,#f0d98a 50%,#d4a94a 75%,#8a6522 100%);}"
            + ".page::after{content:'';position:absolute;inset:18px;border:1px solid rgba(180,140,60,0.18);border-radius:2px;pointer-events:none;}"
            + ".header{padding:54px 56px 40px;text-align:center;position:relative;border-bottom:1px solid rgba(180,140,60,0.18);}"
            + ".crest{width:64px;height:64px;margin:0 auto 18px;background:linear-gradient(135deg,#8a6522 0%,#d4a94a 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px -6px rgba(138,101,34,0.5),inset 0 2px 4px rgba(255,255,255,0.25);position:relative;}"
            + ".crest svg{width:34px;height:34px;fill:#fffdf6;}"
            + ".crest::after{content:'';position:absolute;inset:-6px;border:1px dashed rgba(138,101,34,0.3);border-radius:50%;}"
            + ".brand{font-family:'Cormorant Garamond',serif;font-size:15px;letter-spacing:8px;text-transform:uppercase;color:#8a6522;font-weight:600;margin-bottom:6px;}"
            + "h1{margin:0;font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:700;letter-spacing:-0.5px;color:#2a2014;line-height:1.15;}"
            + ".ornament{display:flex;align-items:center;justify-content:center;gap:14px;margin:16px 0 10px;color:#b88e3e;}"
            + ".ornament .line{width:60px;height:1px;background:linear-gradient(90deg,transparent,#b88e3e,transparent);}"
            + ".ornament .diamond{width:6px;height:6px;background:#d4a94a;transform:rotate(45deg);}"
            + ".subtitle{font-family:'Cormorant Garamond',serif;font-size:17px;color:#6b5a3a;font-style:italic;font-weight:500;}"
            + ".doc-meta{display:flex;justify-content:space-between;margin-top:28px;padding-top:20px;border-top:1px dashed rgba(180,140,60,0.3);font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#8a6522;font-weight:600;}"
            + ".body{padding:44px 56px;position:relative;}"
            + ".preamble{font-family:'Cormorant Garamond',serif;font-size:18px;color:#4a3a22;text-align:center;margin:0 auto 36px;max-width:620px;line-height:1.6;font-style:italic;}"
            + ".preamble strong{font-style:normal;color:#2a2014;font-weight:600;}"
            + ".info-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;background:#fbf6e6;border:1px solid #e6d5a8;border-radius:6px;overflow:hidden;margin-bottom:40px;}"
            + ".info-item{padding:18px 22px;border-right:1px solid #ece0b8;border-bottom:1px solid #ece0b8;}"
            + ".info-item:nth-child(2n){border-right:none;}"
            + ".info-item.full{grid-column:1 / -1;border-right:none;background:linear-gradient(180deg,#faf1d4 0%,#fbf6e6 100%);}"
            + ".info-item:last-child,.info-item:nth-last-child(2):not(.full){border-bottom:none;}"
            + ".info-label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#a88848;font-weight:700;margin-bottom:6px;}"
            + ".info-value{font-size:15px;color:#2a2014;font-weight:600;word-break:break-word;}"
            + ".info-value.mono{font-family:'SF Mono',Menlo,monospace;font-size:12px;color:#6b5a3a;font-weight:500;letter-spacing:0.3px;}"
            + ".info-value.title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:#2a2014;}"
            + ".info-value .muted{display:block;margin-top:2px;font-size:12px;color:#8a7548;font-weight:500;}"
            + ".section-header{display:flex;align-items:center;gap:16px;margin:0 0 22px;}"
            + ".section-header .line{flex:1;height:1px;background:linear-gradient(90deg,transparent,#d4a94a,transparent);}"
            + ".section-title{font-family:'Cormorant Garamond',serif;font-size:22px;text-transform:uppercase;letter-spacing:4px;color:#8a6522;font-weight:700;margin:0;}"
            + ".rules{background:#fffdf6;border:1px solid #e6d5a8;border-radius:6px;padding:32px 36px;font-size:14.5px;color:#2a2014;white-space:pre-wrap;word-wrap:break-word;font-family:'Inter',sans-serif;line-height:1.8;position:relative;box-shadow:inset 0 1px 0 rgba(255,255,255,0.6);}"
            + ".rules::before{content:'\u275D';position:absolute;top:8px;left:16px;font-size:40px;color:#e6d5a8;font-family:Georgia,serif;line-height:1;}"
            + ".rules::after{content:'\u275E';position:absolute;bottom:-8px;right:16px;font-size:40px;color:#e6d5a8;font-family:Georgia,serif;line-height:1;}"
            + ".signature-block{margin-top:44px;padding:36px 40px;background:linear-gradient(135deg,#fbf6e6 0%,#f5e8c0 100%);border:2px solid #d4a94a;border-radius:8px;position:relative;}"
            + ".signature-block::before{content:'\u2605';position:absolute;top:-14px;left:50%;transform:translateX(-50%);width:28px;height:28px;background:#d4a94a;color:#fffdf6;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 4px 10px rgba(138,101,34,0.3);}"
            + ".signature-row{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;}"
            + ".signature-col{flex:1;min-width:220px;}"
            + ".signature-label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#a88848;font-weight:700;margin-bottom:10px;}"
            + ".signature-name{font-family:'Dancing Script',cursive;font-size:48px;color:#2a2014;line-height:1;padding-bottom:10px;border-bottom:1.5px solid #8a6522;display:inline-block;min-width:200px;font-weight:700;}"
            + ".signature-meta{margin-top:14px;font-size:12px;color:#6b5a3a;}"
            + ".signature-meta div{margin-bottom:4px;}"
            + ".signature-meta strong{color:#2a2014;margin-right:6px;}"
            + ".verified-stamp{width:120px;height:120px;border:3px solid #b8372f;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#b8372f;transform:rotate(-8deg);opacity:0.85;flex-shrink:0;}"
            + ".verified-stamp .v-top{font-family:'Cormorant Garamond',serif;font-size:13px;font-weight:700;letter-spacing:2px;}"
            + ".verified-stamp .v-mid{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;letter-spacing:1px;border-top:2px solid #b8372f;border-bottom:2px solid #b8372f;padding:4px 10px;margin:4px 0;}"
            + ".verified-stamp .v-bot{font-size:9px;letter-spacing:1.5px;font-weight:600;}"
            + ".footer{padding:24px 56px 32px;background:#fbf6e6;border-top:1px solid #e6d5a8;text-align:center;}"
            + ".footer-title{font-family:'Cormorant Garamond',serif;font-size:14px;color:#8a6522;font-weight:600;font-style:italic;margin-bottom:6px;}"
            + ".footer-text{font-size:11px;color:#8a7548;letter-spacing:0.3px;line-height:1.6;}"
            + ".footer-divider{display:flex;align-items:center;justify-content:center;gap:10px;margin:10px 0;color:#d4a94a;font-size:10px;}"
            + "@media (max-width:620px){.info-grid{grid-template-columns:1fr;}.info-item{border-right:none!important;}.header,.body,.footer{padding-left:28px;padding-right:28px;}h1{font-size:30px;}.signature-row{flex-direction:column;align-items:flex-start;}.verified-stamp{align-self:center;}}"
            + "@media print{body{background:#fff;padding:0;}.page{box-shadow:none;border-radius:0;}.page::after{display:none;}}"
            + "</style></head><body>"
            + "<div class=\"page\">"
            + "<div class=\"header\">"
            + "<div class=\"crest\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z\"/></svg></div>"
            + "<div class=\"brand\">BidSmart</div>"
            + "<h1>Auction Consent Agreement</h1>"
            + "<div class=\"ornament\"><span class=\"line\"></span><span class=\"diamond\"></span><span class=\"line\"></span></div>"
            + "<div class=\"subtitle\">An electronically signed covenant between buyer and seller</div>"
            + "<div class=\"doc-meta\"><span>Document N\u00BA " + docNumber + "</span><span>Issued " + escape(signedDateShort) + "</span></div>"
            + "</div>"
            + "<div class=\"body\">"
            + "<p class=\"preamble\">This instrument certifies that <strong>" + escape(consent.getUser().getFullName()) + "</strong> has read, understood and willingly consented to the rules governing the auction of <strong>" + escape(auction.getTitle()) + "</strong>, executed on the date hereunder set forth.</p>"
            + "<div class=\"info-grid\">"
            + "<div class=\"info-item full\"><div class=\"info-label\">Auction Lot</div><div class=\"info-value title\">" + escape(auction.getTitle()) + "</div></div>"
            + "<div class=\"info-item\"><div class=\"info-label\">Buyer</div><div class=\"info-value\">" + escape(consent.getUser().getFullName()) + "<span class=\"muted\">" + escape(consent.getUser().getEmail()) + "</span></div></div>"
            + "<div class=\"info-item\"><div class=\"info-label\">Seller</div><div class=\"info-value\">" + sellerName + "</div></div>"
            + "<div class=\"info-item\"><div class=\"info-label\">Signed At</div><div class=\"info-value\">" + escape(signedAt) + "</div></div>"
            + "<div class=\"info-item\"><div class=\"info-label\">Auction ID</div><div class=\"info-value mono\">" + auction.getId() + "</div></div>"
            + "<div class=\"info-item full\"><div class=\"info-label\">Buyer ID</div><div class=\"info-value mono\">" + consent.getUser().getId() + "</div></div>"
            + "</div>"
            + "<div class=\"section-header\"><span class=\"line\"></span><h2 class=\"section-title\">Rules &amp; Regulations</h2><span class=\"line\"></span></div>"
            + "<div class=\"rules\">" + escape(rules) + "</div>"
            + "<div class=\"signature-block\">"
            + "<div class=\"signature-row\">"
            + "<div class=\"signature-col\">"
            + "<div class=\"signature-label\">Signed by the Buyer</div>"
            + "<div class=\"signature-name\">" + escape(consent.getSignatureName()) + "</div>"
            + "<div class=\"signature-meta\">"
            + "<div><strong>Executed on:</strong> " + escape(signedAt) + "</div>"
            + "<div><strong>IP Address:</strong> " + escape(consent.getIpAddress()) + "</div>"
            + "</div>"
            + "</div>"
            + "<div class=\"verified-stamp\"><div class=\"v-top\">BidSmart</div><div class=\"v-mid\">VERIFIED</div><div class=\"v-bot\">" + escape(signedDateShort).toUpperCase() + "</div></div>"
            + "</div>"
            + "</div>"
            + "</div>"
            + "<div class=\"footer\">"
            + "<div class=\"footer-title\">\u2014 A Binding Electronic Covenant \u2014</div>"
            + "<div class=\"footer-divider\"><span>\u2756</span></div>"
            + "<div class=\"footer-text\">This document is electronically signed and legally enforceable under applicable e-signature laws.<br/>Preserve this record for your own reference. \u00A9 BidSmart Marketplace.</div>"
            + "</div>"
            + "</div></body></html>";
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
