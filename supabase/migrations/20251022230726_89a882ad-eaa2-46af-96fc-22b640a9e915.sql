-- Rename event_date to start_date for clarity
ALTER TABLE events RENAME COLUMN event_date TO start_date;

-- Add end_date column (nullable since existing events won't have it)
ALTER TABLE events ADD COLUMN end_date timestamp with time zone;