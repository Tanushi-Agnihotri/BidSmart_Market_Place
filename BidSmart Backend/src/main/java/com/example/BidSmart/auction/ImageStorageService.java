package com.example.BidSmart.auction;

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

@Service
public class ImageStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private final CloudinaryService cloudinaryService;
    private final Path uploadDir;
    private final boolean cloudinaryEnabled;

    public ImageStorageService(CloudinaryService cloudinaryService,
                               @Value("${app.upload.dir:uploads}") String uploadPath,
                               @Value("${cloudinary.url:}") String cloudinaryUrl) {
        this.cloudinaryService = cloudinaryService;
        // Cloudinary is active only when a real URL is configured (not placeholder/empty)
        this.cloudinaryEnabled = cloudinaryUrl != null
            && !cloudinaryUrl.isBlank()
            && !cloudinaryUrl.contains("placeholder");
        this.uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            // Best-effort — directory may already exist
        }
        System.out.println("[ImageStorage] mode = " + (cloudinaryEnabled ? "CLOUDINARY" : "LOCAL (set CLOUDINARY_URL to enable)"));
    }

    /**
     * Stores a file. Uses Cloudinary if configured, otherwise local disk.
     * Returns a Cloudinary HTTPS URL or a local filename (e.g. "uuid.jpg").
     */
    public String store(MultipartFile file) {
        validateFile(file);
        if (cloudinaryEnabled) {
            try {
                return cloudinaryService.upload(file);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image to Cloudinary", e);
            }
        } else {
            // Local storage fallback (for development without Cloudinary)
            String ext = "";
            String originalName = file.getOriginalFilename();
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }
            String storedName = UUID.randomUUID() + ext;
            try {
                Path target = uploadDir.resolve(storedName);
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                return storedName;
            } catch (IOException e) {
                throw new RuntimeException("Failed to store file locally", e);
            }
        }
    }

    /**
     * Serves a local file by name — used by GET /api/images/{fileName}.
     * Backward-compatible for old local uploads and local dev mode.
     */
    public Path load(String fileName) {
        Path resolved = uploadDir.resolve(fileName).normalize();
        // Prevent path traversal
        if (!resolved.startsWith(uploadDir)) {
            throw new IllegalArgumentException("Invalid file path");
        }
        return resolved;
    }

    /**
     * Deletes an image — from Cloudinary if URL, from local disk otherwise.
     */
    public void delete(String filePath) {
        if (filePath == null) return;
        if (filePath.startsWith("https://res.cloudinary.com")) {
            String publicId = cloudinaryService.extractPublicId(filePath);
            cloudinaryService.delete(publicId);
        } else {
            try {
                Files.deleteIfExists(uploadDir.resolve(filePath));
            } catch (IOException e) {
                // ignore
            }
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, WebP, and GIF images are allowed");
        }
    }
}
