-- Delete all request fulfillments first (foreign key dependency)
DELETE FROM request_fulfillments;

-- Delete all comments related to requests
DELETE FROM comments WHERE content_type = 'request';

-- Delete all requests
DELETE FROM requests;