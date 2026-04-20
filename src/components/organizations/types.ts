
export type OrganizationType = "Non-Profit" | "School" | "Professional Association" | "Industry Partner";

export const organizationTypes: OrganizationType[] = [
  "Non-Profit",
  "School",
  "Professional Association",
  "Industry Partner"
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
