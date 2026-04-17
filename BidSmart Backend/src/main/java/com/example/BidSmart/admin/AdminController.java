package com.example.BidSmart.admin;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.BidSmart.admin.dto.AdminBuyerResponse;
import com.example.BidSmart.admin.dto.AdminSellerResponse;
import com.example.BidSmart.admin.dto.AdminUserResponse;
import com.example.BidSmart.admin.dto.ChartDataResponse;
import com.example.BidSmart.admin.dto.DashboardStatsResponse;
import com.example.BidSmart.admin.dto.UpdateUserRoleRequest;
import com.example.BidSmart.admin.dto.UpdateUserStatusRequest;
import com.example.BidSmart.admin.dto.VerifyRequest;
import com.example.BidSmart.auction.dto.AuctionResponse;
import com.example.BidSmart.user.User;
import com.example.BidSmart.user.VerificationStatus;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/dashboard/charts")
    public ResponseEntity<ChartDataResponse> getChartData() {
        return ResponseEntity.ok(adminService.getChartData());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<AdminUserResponse> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, request.status()));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<AdminUserResponse> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(id, request.role()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/auctions/{id}")
    public ResponseEntity<Void> deleteAuction(@PathVariable UUID id) {
        adminService.deleteAuction(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sellers")
    public ResponseEntity<List<AdminSellerResponse>> getSellers(
            @RequestParam(required = false) VerificationStatus status) {
        return ResponseEntity.ok(adminService.getSellers(status));
    }

    @PatchMapping("/sellers/{id}/verify")
    public ResponseEntity<AdminSellerResponse> verifySeller(
            @PathVariable UUID id,
            @Valid @RequestBody VerifyRequest request,
            Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return ResponseEntity.ok(adminService.verifySeller(id, request.decision(), request.reason(), admin));
    }

    @GetMapping("/buyers")
    public ResponseEntity<List<AdminBuyerResponse>> getBuyers(
            @RequestParam(required = false) VerificationStatus status) {
        return ResponseEntity.ok(adminService.getBuyers(status));
    }

    @PatchMapping("/buyers/{id}/verify")
    public ResponseEntity<AdminBuyerResponse> verifyBuyer(
            @PathVariable UUID id,
            @Valid @RequestBody VerifyRequest request,
            Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return ResponseEntity.ok(adminService.verifyBuyer(id, request.decision(), request.reason(), admin));
    }

    @GetMapping("/auctions")
    public ResponseEntity<List<AuctionResponse>> getAuctions(
            @RequestParam(required = false) VerificationStatus verificationStatus) {
        return ResponseEntity.ok(adminService.getAuctionsByVerification(verificationStatus));
    }

    @PatchMapping("/auctions/{id}/verify")
    public ResponseEntity<AuctionResponse> verifyAuction(
            @PathVariable UUID id,
            @Valid @RequestBody VerifyRequest request,
            Authentication authentication) {
        User admin = (User) authentication.getPrincipal();
        return ResponseEntity.ok(adminService.verifyAuction(id, request.decision(), request.reason(), admin));
    }
}
