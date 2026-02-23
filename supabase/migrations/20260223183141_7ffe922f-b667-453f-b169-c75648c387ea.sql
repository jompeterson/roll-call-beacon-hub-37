-- Unlink users from these organizations first
UPDATE user_profiles SET organization_id = NULL WHERE organization_id IN ('65287725-750a-49e6-be34-758c803b75eb', '2e101f49-4de3-48fb-95e7-99475b1d0d22', '44e6e2e5-a087-45d6-86e0-e5ce2862c6db');

-- Also clear contact_user_id references
UPDATE organizations SET contact_user_id = NULL WHERE id IN ('65287725-750a-49e6-be34-758c803b75eb', '2e101f49-4de3-48fb-95e7-99475b1d0d22', '44e6e2e5-a087-45d6-86e0-e5ce2862c6db');

-- Now delete the organizations
DELETE FROM organizations WHERE id IN ('65287725-750a-49e6-be34-758c803b75eb', '2e101f49-4de3-48fb-95e7-99475b1d0d22', '44e6e2e5-a087-45d6-86e0-e5ce2862c6db');