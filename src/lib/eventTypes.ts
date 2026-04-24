export const EVENT_TYPES = [
  "Networking",
  "Workshop",
  "Conference",
  "Social",
  "Training",
  "Fundraiser",
] as const;

export type EventType = typeof EVENT_TYPES[number];
