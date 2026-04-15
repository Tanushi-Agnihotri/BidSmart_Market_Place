-- Add Google OAuth support to users
ALTER TABLE users
    ADD COLUMN google_sub VARCHAR(64);

ALTER TABLE users
    ADD CONSTRAINT uk_users_google_sub UNIQUE (google_sub);

-- Allow password_hash to be NULL for Google-only users
ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;
