package com.example.BidSmart.user.dto;

import com.example.BidSmart.user.User;

public record NotificationPrefsResponse(
    boolean emailBids,
    boolean emailAuctions,
    boolean emailNewsletter,
    boolean pushBids,
    boolean pushEnding
) {
    public static NotificationPrefsResponse from(User user) {
        return new NotificationPrefsResponse(
            user.isNotifEmailBids(),
            user.isNotifEmailAuctions(),
            user.isNotifEmailNewsletter(),
            user.isNotifPushBids(),
            user.isNotifPushEnding()
        );
    }
}
