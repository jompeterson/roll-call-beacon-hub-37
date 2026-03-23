
export type OrganizationType = "Non-Profit" | "School" | "Community Group" | "Religious Organization" | "Sports Club" | "Professional Association" | "Industry Partner" | "Other";

export const organizationTypes: OrganizationType[] = [
  "Non-Profit",
  "School",
  "Community Group",
  "Religious Organization",
  "Sports Club",
  "Professional Association",
  "Industry Partner",
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
