-- Switch remaining foreign keys to ON DELETE CASCADE so deleting a user
-- (or an auction) automatically removes its dependent rows.

-- auctions.seller_id -> users
ALTER TABLE auctions DROP CONSTRAINT IF EXISTS fk_auctions_seller;
ALTER TABLE auctions
    ADD CONSTRAINT fk_auctions_seller
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE;

-- bids.bidder_id -> users, bids.auction_id -> auctions
ALTER TABLE bids DROP CONSTRAINT IF EXISTS fk_bids_bidder;
ALTER TABLE bids
    ADD CONSTRAINT fk_bids_bidder
    FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE bids DROP CONSTRAINT IF EXISTS fk_bids_auction;
ALTER TABLE bids
    ADD CONSTRAINT fk_bids_auction
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE;

-- watchlist.user_id -> users, watchlist.auction_id -> auctions
ALTER TABLE watchlist DROP CONSTRAINT IF EXISTS fk_watchlist_user;
ALTER TABLE watchlist
    ADD CONSTRAINT fk_watchlist_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE watchlist DROP CONSTRAINT IF EXISTS fk_watchlist_auction;
ALTER TABLE watchlist
    ADD CONSTRAINT fk_watchlist_auction
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE;

-- notifications.user_id -> users
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS fk_notifications_user;
ALTER TABLE notifications
    ADD CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
