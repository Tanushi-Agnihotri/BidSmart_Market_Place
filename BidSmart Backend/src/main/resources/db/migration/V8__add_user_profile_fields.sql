-- Add profile fields to users table
ALTER TABLE users ADD COLUMN phone VARCHAR(30);
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN location VARCHAR(150);

-- Add notification preferences columns (stored as booleans)
ALTER TABLE users ADD COLUMN notif_email_bids BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN notif_email_auctions BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN notif_email_newsletter BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN notif_push_bids BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN notif_push_ending BOOLEAN NOT NULL DEFAULT TRUE;
