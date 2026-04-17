package com.example.BidSmart.consent.dto;

import java.time.OffsetDateTime;

public record ConsentStatusResponse(
    boolean required,
    boolean signed,
    boolean windowOpen,
    OffsetDateTime consentStartTime,
    OffsetDateTime consentEndTime,
    String rulesAndRegulations,
    ConsentResponse consent
) {}
