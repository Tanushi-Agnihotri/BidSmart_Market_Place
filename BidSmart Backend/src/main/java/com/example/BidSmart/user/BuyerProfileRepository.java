package com.example.BidSmart.user;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BuyerProfileRepository extends JpaRepository<BuyerProfile, UUID> {
    Optional<BuyerProfile> findByUserId(UUID userId);
    List<BuyerProfile> findByStatusOrderByCreatedAtAsc(VerificationStatus status);
    List<BuyerProfile> findAllByOrderByCreatedAtDesc();
    long countByStatus(VerificationStatus status);
    boolean existsByUserIdAndStatus(UUID userId, VerificationStatus status);
}
