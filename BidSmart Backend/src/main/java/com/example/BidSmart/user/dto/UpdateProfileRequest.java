package com.example.BidSmart.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
    String fullName,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150)
    String email,

    @Size(max = 30, message = "Phone must be at most 30 characters")
    String phone,

    String bio,

    @Size(max = 150, message = "Location must be at most 150 characters")
    String location
) {}
