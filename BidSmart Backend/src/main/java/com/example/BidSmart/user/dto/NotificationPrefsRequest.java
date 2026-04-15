package com.example.BidSmart.user.dto;

public record NotificationPrefsRequest(
    Boolean emailBids,
    Boolean emailAuctions,
    Boolean emailNewsletter,
    Boolean pushBids,
    Boolean pushEnding
) {}
