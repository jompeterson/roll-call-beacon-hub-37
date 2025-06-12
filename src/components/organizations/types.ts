
export type OrganizationType = "Non-Profit" | "Educational Institution" | "Community Group" | "Religious Organization" | "Sports Club" | "Professional Association" | "Other";

export const organizationTypes: OrganizationType[] = [
  "Non-Profit",
  "Educational Institution",
  "Community Group",
  "Religious Organization",
  "Sports Club",
  "Professional Association",
  "Other"
];

export interface OrganizationFormData {
  name: string;
  type: OrganizationType | "";
  description: string;
  phone: string;
  address: string;
}

export interface OrganizationCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrganizationCreated: () => void;
}
