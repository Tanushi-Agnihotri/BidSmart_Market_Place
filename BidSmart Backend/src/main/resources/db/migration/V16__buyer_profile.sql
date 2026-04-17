CREATE TABLE buyer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    legal_name VARCHAR(100) NOT NULL,
    id_document_type VARCHAR(30) NOT NULL,
    id_document_number VARCHAR(50) NOT NULL,
    id_document_url VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_buyer_profiles_status CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    CONSTRAINT chk_buyer_profiles_id_type CHECK (id_document_type IN ('AADHAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE'))
);
CREATE INDEX idx_buyer_profiles_status ON buyer_profiles(status);
