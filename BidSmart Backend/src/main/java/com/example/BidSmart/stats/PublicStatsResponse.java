package com.example.BidSmart.stats;

import java.math.BigDecimal;

public record PublicStatsResponse(
    long totalAuctions,
    long totalBids,
    long activeUsers,
    BigDecimal totalRevenue
) {}
