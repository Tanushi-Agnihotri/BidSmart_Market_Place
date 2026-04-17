-- Migrate seller_profiles.status to VerificationStatus enum values
UPDATE seller_profiles SET status = 'VERIFIED' WHERE status = 'APPROVED';
UPDATE seller_profiles SET status = 'PENDING' WHERE status NOT IN ('PENDING', 'VERIFIED', 'REJECTED');

ALTER TABLE seller_profiles
    ADD COLUMN rejection_reason TEXT,
    ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN reviewed_by UUID;

ALTER TABLE seller_profiles
    ADD CONSTRAINT chk_seller_profiles_status CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED'));

CREATE INDEX idx_seller_profiles_status ON seller_profiles(status);
