package com.example.BidSmart.user;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "google_sub", unique = true, length = 64)
    private String googleSub;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(length = 30)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 150)
    private String location;

    @Column(name = "notif_email_bids", nullable = false)
    private boolean notifEmailBids = true;

    @Column(name = "notif_email_auctions", nullable = false)
    private boolean notifEmailAuctions = true;

    @Column(name = "notif_email_newsletter", nullable = false)
    private boolean notifEmailNewsletter = false;

    @Column(name = "notif_push_bids", nullable = false)
    private boolean notifPushBids = true;

    @Column(name = "notif_push_ending", nullable = false)
    private boolean notifPushEnding = true;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getGoogleSub() { return googleSub; }
    public void setGoogleSub(String googleSub) { this.googleSub = googleSub; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public boolean isNotifEmailBids() { return notifEmailBids; }
    public void setNotifEmailBids(boolean v) { this.notifEmailBids = v; }

    public boolean isNotifEmailAuctions() { return notifEmailAuctions; }
    public void setNotifEmailAuctions(boolean v) { this.notifEmailAuctions = v; }

    public boolean isNotifEmailNewsletter() { return notifEmailNewsletter; }
    public void setNotifEmailNewsletter(boolean v) { this.notifEmailNewsletter = v; }

    public boolean isNotifPushBids() { return notifPushBids; }
    public void setNotifPushBids(boolean v) { this.notifPushBids = v; }

    public boolean isNotifPushEnding() { return notifPushEnding; }
    public void setNotifPushEnding(boolean v) { this.notifPushEnding = v; }
}
