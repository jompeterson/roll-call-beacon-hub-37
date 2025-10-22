-- Rename volunteer_date to start_date for clarity
ALTER TABLE volunteers RENAME COLUMN volunteer_date TO start_date;

-- Add end_date column (nullable since existing volunteers won't have it)
ALTER TABLE volunteers ADD COLUMN end_date timestamp with time zone;