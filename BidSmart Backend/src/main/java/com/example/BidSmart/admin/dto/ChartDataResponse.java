package com.example.BidSmart.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public record ChartDataResponse(
    List<MonthlyRevenue> monthlyRevenue,
    List<DailyBids> dailyBids,
    List<CategoryCount> categoryData
) {
    public record MonthlyRevenue(String month, BigDecimal revenue) {}
    public record DailyBids(String day, long bids) {}
    public record CategoryCount(String name, long value) {}
}
