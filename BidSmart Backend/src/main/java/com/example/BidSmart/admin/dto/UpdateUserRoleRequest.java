package com.example.BidSmart.admin.dto;

import com.example.BidSmart.user.UserRole;

import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
    @NotNull(message = "Role is required")
    UserRole role
) {
}
