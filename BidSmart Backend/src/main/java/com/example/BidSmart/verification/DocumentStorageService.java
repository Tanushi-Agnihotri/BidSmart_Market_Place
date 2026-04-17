package com.example.BidSmart.verification;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.BidSmart.auction.CloudinaryService;

@Service
public class DocumentStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "application/pdf", "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    private final CloudinaryService cloudinaryService;
    private final Path uploadDir;
    private final boolean cloudinaryEnabled;

    public DocumentStorageService(CloudinaryService cloudinaryService,
                                  @Value("${app.upload.dir:uploads}") String uploadPath,
                                  @Value("${cloudinary.url:}") String cloudinaryUrl) {
        this.cloudinaryService = cloudinaryService;
        this.cloudinaryEnabled = cloudinaryUrl != null
            && !cloudinaryUrl.isBlank()
            && !cloudinaryUrl.contains("placeholder");
        this.uploadDir = Paths.get(uploadPath, "docs").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            // best-effort
        }
    }

    public String store(MultipartFile file) {
        validate(file);
        if (cloudinaryEnabled) {
            try {
                return cloudinaryService.uploadDocument(file);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload document to Cloudinary", e);
            }
        }
        String ext = "";
        String name = file.getOriginalFilename();
        if (name != null && name.contains(".")) ext = name.substring(name.lastIndexOf("."));
        String stored = UUID.randomUUID() + ext;
        try {
            Path target = uploadDir.resolve(stored);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "docs/" + stored;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store document locally", e);
        }
    }

    private void validate(MultipartFile file) {
        if (file.isEmpty()) throw new IllegalArgumentException("File is empty");
        if (file.getSize() > MAX_FILE_SIZE) throw new IllegalArgumentException("Document exceeds 10MB limit");
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_TYPES.contains(ct)) {
            throw new IllegalArgumentException("Only PDF, JPEG, PNG, and WebP files are allowed");
        }
    }
}
