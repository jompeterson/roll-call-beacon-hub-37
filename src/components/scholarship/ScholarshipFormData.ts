
export interface ScholarshipFormData {
  title: string;
  amount: string;
  description: string;
  eligibility_criteria: string;
  application_deadline: string;
  contact_email: string;
  contact_phone: string;
  scholarship_link: string;
}

export const createInitialFormData = (userProfile?: { email?: string; phone?: string }): ScholarshipFormData => ({
  title: "",
  amount: "",
  description: "",
  eligibility_criteria: "",
  application_deadline: "",
  contact_email: userProfile?.email || "",
  contact_phone: userProfile?.phone || "",
  scholarship_link: "",
});
