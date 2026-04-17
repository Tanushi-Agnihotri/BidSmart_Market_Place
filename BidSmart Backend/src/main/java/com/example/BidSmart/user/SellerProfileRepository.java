package com.example.BidSmart.user;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SellerProfileRepository extends JpaRepository<SellerProfile, UUID> {
    Optional<SellerProfile> findByUserId(UUID userId);
    List<SellerProfile> findByStatusOrderByCreatedAtAsc(VerificationStatus status);
    long countByStatus(VerificationStatus status);
}
