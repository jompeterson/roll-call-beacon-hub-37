
import type { Donation } from "@/hooks/useDonations";

interface DonationModalInformationProps {
  donation: Donation;
  isScholarship?: boolean;
  isEvent?: boolean;
  isOrganization?: boolean;
  isUser?: boolean;
  getInformationTitle: () => string;
  getOrganizationBio: () => string;
  getUserBio: () => string;
  formatAmount: (amount: number) => string;
}

export const DonationModalInformation = ({
  donation,
  isScholarship = false,
  isEvent = false,
  isOrganization = false,
  isUser = false,
  getInformationTitle,
  getOrganizationBio,
  getUserBio,
  formatAmount
}: DonationModalInformationProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">{getInformationTitle()}</h3>
        <div className="space-y-4">
          {!isScholarship && !isEvent && !isOrganization && !isUser && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Donation Title</label>
              <p className="text-base mt-1">{donation.title}</p>
            </div>
          )}
          {!isOrganization && !isUser && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">
                {isEvent ? "Event Details" : isScholarship ? "Scholarship Details" : "Donation Details"}
              </label>
              <p className="text-base mt-1">{donation.description || "No description provided"}</p>
            </div>
          )}
          {isOrganization && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Organization Bio</label>
              <p className="text-base mt-1">{getOrganizationBio()}</p>
            </div>
          )}
          {isUser && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">User Bio</label>
              <p className="text-base mt-1">{getUserBio()}</p>
            </div>
          )}
          {!isOrganization && !isUser && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">
                {isEvent ? "Volunteer Hours" : isScholarship ? "Scholarship Amount" : "Estimated Amount"}
              </label>
              <p className="text-base mt-1">
                {formatAmount(donation.amount_needed)}
              </p>
            </div>
          )}
          {!isScholarship && !isEvent && !isOrganization && !isUser && donation.weight && donation.weight > 0 && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Weight of Donation</label>
              <p className="text-base mt-1">{donation.weight} lbs</p>
            </div>
          )}
          {donation.contact_email && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Contact Email</label>
              <p className="text-base mt-1">{donation.contact_email}</p>
            </div>
          )}
          {donation.contact_phone && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Contact Phone</label>
              <p className="text-base mt-1">{donation.contact_phone}</p>
            </div>
          )}
          {donation.target_date && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Deadline</label>
              <p className="text-base mt-1">{new Date(donation.target_date).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
