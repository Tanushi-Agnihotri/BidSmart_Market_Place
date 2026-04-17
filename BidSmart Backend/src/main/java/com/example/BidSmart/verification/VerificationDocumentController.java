package com.example.BidSmart.verification;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.BidSmart.auction.Auction;
import com.example.BidSmart.auction.AuctionRepository;
import com.example.BidSmart.exception.ApiException;
import com.example.BidSmart.user.User;
import com.example.BidSmart.user.UserRole;

@RestController
@RequestMapping("/api/auctions/{auctionId}/verification-documents")
public class VerificationDocumentController {

    private final AuctionRepository auctionRepository;
    private final AuctionVerificationDocumentRepository docRepository;
    private final DocumentStorageService storageService;

    public VerificationDocumentController(AuctionRepository auctionRepository,
                                          AuctionVerificationDocumentRepository docRepository,
                                          DocumentStorageService storageService) {
        this.auctionRepository = auctionRepository;
        this.docRepository = docRepository;
        this.storageService = storageService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<UploadResponse> upload(@PathVariable UUID auctionId,
                                                 @RequestParam("file") MultipartFile file,
                                                 @RequestParam(value = "docType", defaultValue = "OTHER") String docType,
                                                 Authentication auth) {
        User user = (User) auth.getPrincipal();
        Auction auction = auctionRepository.findById(auctionId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Auction not found"));

        if (!auction.getSeller().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the seller can upload verification documents");
        }

        if (docRepository.countByAuctionId(auctionId) >= 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Maximum 5 verification documents per auction");
        }

        String stored;
        try {
            stored = storageService.store(file);
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        AuctionVerificationDocument doc = new AuctionVerificationDocument();
        doc.setAuction(auction);
        doc.setDocType(docType);
        doc.setFileName(file.getOriginalFilename() == null ? "document" : file.getOriginalFilename());
        doc.setFilePath(stored);
        doc.setFileSize(file.getSize());
        doc.setContentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType());
        docRepository.save(doc);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            new UploadResponse(doc.getId(), doc.getDocType(), doc.getFileName(), fileUrl(doc), doc.getFileSize())
        );
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> list(@PathVariable UUID auctionId, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Auction auction = auctionRepository.findById(auctionId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Auction not found"));

        boolean isSeller = auction.getSeller().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        if (!isSeller && !isAdmin) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not authorized to view verification documents");
        }

        List<DocumentResponse> docs = docRepository.findByAuctionIdOrderByUploadedAtAsc(auctionId).stream()
            .map(d -> new DocumentResponse(d.getId(), d.getDocType(), d.getFileName(), fileUrl(d), d.getFileSize(), d.getContentType(), d.getUploadedAt().toString()))
            .toList();
        return ResponseEntity.ok(docs);
    }

    private String fileUrl(AuctionVerificationDocument d) {
        String fp = d.getFilePath();
        return (fp != null && fp.startsWith("http")) ? fp : "/api/images/" + fp;
    }

    public record UploadResponse(UUID id, String docType, String fileName, String url, long fileSize) {}

    public record DocumentResponse(UUID id, String docType, String fileName, String url, long fileSize,
                                   String contentType, String uploadedAt) {}
}
