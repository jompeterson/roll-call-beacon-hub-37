-- Add link column to events table
ALTER TABLE events ADD COLUMN event_link text;

-- Add link column to volunteers table
ALTER TABLE volunteers ADD COLUMN volunteer_link text;