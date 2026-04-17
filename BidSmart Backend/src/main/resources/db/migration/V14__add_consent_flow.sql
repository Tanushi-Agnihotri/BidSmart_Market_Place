-- Auction: consent window + rules + enforce 1-24h duration constraint
ALTER TABLE auctions
    ADD COLUMN rules_and_regulations TEXT,
    ADD COLUMN consent_start_time TIMESTAMP WITH TIME ZONE,
    ADD COLUMN consent_end_time TIMESTAMP WITH TIME ZONE,
    ADD COLUMN consent_required BOOLEAN NOT NULL DEFAULT FALSE;

-- Auction consents table: one signed record per (auction, buyer)
CREATE TABLE auction_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    signature_name VARCHAR(200) NOT NULL,
    signature_data TEXT,
    signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    document_path VARCHAR(500),
    ip_address VARCHAR(64),
    CONSTRAINT uq_auction_user_consent UNIQUE (auction_id, user_id)
);

CREATE INDEX idx_consents_auction ON auction_consents(auction_id);
CREATE INDEX idx_consents_user ON auction_consents(user_id);
