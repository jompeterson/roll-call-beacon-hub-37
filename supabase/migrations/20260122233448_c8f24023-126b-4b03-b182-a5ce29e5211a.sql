-- Delete all donation acceptances first (foreign key dependency)
DELETE FROM donation_acceptances;

-- Delete all request fulfillments (foreign key dependency)
DELETE FROM request_fulfillments;

-- Delete all event RSVPs (foreign key dependency)
DELETE FROM event_rsvps;

-- Delete all volunteer signups (foreign key dependency)
DELETE FROM volunteer_signups;

-- Delete all comments related to these content types
DELETE FROM comments WHERE content_type IN ('donation', 'scholarship', 'event', 'volunteer');

-- Delete all donations
DELETE FROM donations;

-- Delete all scholarships
DELETE FROM scholarships;

-- Delete all events
DELETE FROM events;

-- Delete all volunteers
DELETE FROM volunteers;