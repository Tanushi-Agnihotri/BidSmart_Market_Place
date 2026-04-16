-- Widen file_path to TEXT to hold full Cloudinary URLs (previously VARCHAR(500))
ALTER TABLE auction_images ALTER COLUMN file_path TYPE TEXT;
