export interface NotificationTypeDef {
  key: string;
  label: string;
  description: string;
  category: string;
}

export const NOTIFICATION_TYPES: NotificationTypeDef[] = [
  { key: "new_post_donation", label: "New In-Kind Donations", description: "When someone posts a new in-kind donation", category: "New Posts" },
  { key: "new_post_request", label: "New Requests", description: "When someone posts a new request", category: "New Posts" },
  { key: "new_post_scholarship", label: "New Scholarships", description: "When someone posts a new scholarship", category: "New Posts" },
  { key: "new_post_event", label: "New Networking Events", description: "When someone posts a new event", category: "New Posts" },
  { key: "new_post_volunteer", label: "New Volunteer Opportunities", description: "When someone posts a new volunteer opportunity", category: "New Posts" },
  { key: "post_comment", label: "Comments on My Posts", description: "When someone comments on your post", category: "Activity on My Posts" },
  { key: "comment_reply", label: "Replies to My Comments", description: "When someone replies to your comment", category: "Activity on My Posts" },
  { key: "donation_acceptance", label: "Donation Acceptances", description: "When someone wants your donation", category: "Activity on My Posts" },
  { key: "request_fulfillment", label: "Request Fulfillments", description: "When someone wants to fulfill your request", category: "Activity on My Posts" },
  { key: "user_registration", label: "New User Registrations", description: "When a new user registers (admins only)", category: "Admin" },
];
