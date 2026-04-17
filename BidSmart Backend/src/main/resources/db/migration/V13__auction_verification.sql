ALTER TABLE auctions
    ADD COLUMN verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN verification_reason TEXT,
    ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN verified_by UUID;

-- Existing auctions are grandfathered as verified so nothing disappears from live listings.
UPDATE auctions SET verification_status = 'VERIFIED';

ALTER TABLE auctions
    ADD CONSTRAINT chk_auctions_verification_status CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED'));

CREATE INDEX idx_auctions_verification_status ON auctions(verification_status);
