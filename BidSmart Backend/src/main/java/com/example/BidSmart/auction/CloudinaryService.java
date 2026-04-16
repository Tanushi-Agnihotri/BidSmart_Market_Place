package com.example.BidSmart.auction;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(@Value("${cloudinary.url}") String cloudinaryUrl) {
        this.cloudinary = new Cloudinary(cloudinaryUrl);
        this.cloudinary.config.secure = true;
    }

    /** Upload a file and return its secure HTTPS URL. */
    public String upload(MultipartFile file) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "folder", "bidsmart",
                "resource_type", "image"
            )
        );
        return (String) result.get("secure_url");
    }

    /** Delete an image by its Cloudinary public_id. */
    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            System.err.println("[Cloudinary] Failed to delete: " + publicId + " — " + e.getMessage());
        }
    }

    /**
     * Extract the Cloudinary public_id from a secure_url.
     * e.g. https://res.cloudinary.com/mycloud/image/upload/v123/bidsmart/abc.jpg → bidsmart/abc
     */
    public String extractPublicId(String secureUrl) {
        try {
            String[] parts = secureUrl.split("/upload/");
            String afterUpload = parts[1]; // v123/bidsmart/abc.jpg
            // Strip version segment (v followed by digits)
            if (afterUpload.matches("v\\d+/.*")) {
                afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1);
            }
            // Strip file extension
            int dotIdx = afterUpload.lastIndexOf('.');
            if (dotIdx > 0) afterUpload = afterUpload.substring(0, dotIdx);
            return afterUpload; // bidsmart/abc
        } catch (Exception e) {
            return secureUrl; // fallback
        }
    }
}
