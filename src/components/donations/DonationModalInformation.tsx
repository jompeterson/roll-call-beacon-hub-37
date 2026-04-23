
import type { Donation } from "@/hooks/useDonations";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
  highlightedFields?: string[];
}

const FieldWrapper = ({ fieldKey, highlightedFields, children }: { fieldKey: string; highlightedFields?: string[]; children: React.ReactNode }) => {
  const isHighlighted = highlightedFields?.includes(fieldKey);
  return (
    <div className={cn(isHighlighted && "bg-destructive/10 border border-destructive/30 rounded-md p-2 -mx-2")}>
      {children}
    </div>
  );
};

export const DonationModalInformation = ({
  donation,
  isScholarship = false,
  isEvent = false,
  isOrganization = false,
  isUser = false,
  getInformationTitle,
  getOrganizationBio,
  getUserBio,
  formatAmount,
  highlightedFields,
}: DonationModalInformationProps) => {
  const d = donation as any;
  const donationType = d.donation_type || "";
  const isPhysical = ["Tools", "Materials"].includes(donationType);
  const isServices = donationType === "Professional Services / Labor";
  const isTransportation = donationType === "Transportation / Equipment Use";
  const isFacility = donationType === "Facility Use";
  const isDonationView = !isScholarship && !isEvent && !isOrganization && !isUser;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">{getInformationTitle()}</h3>
        <div className="space-y-4">
          {isDonationView && (
            <FieldWrapper fieldKey="title" highlightedFields={highlightedFields}>
              <div>
                <label className={cn("font-medium text-sm", highlightedFields?.includes("title") ? "text-destructive" : "text-muted-foreground")}>Donation Title</label>
                <p className="text-base mt-1">{donation.title}</p>
              </div>
            </FieldWrapper>
          )}
          {!isOrganization && !isUser && (
            <FieldWrapper fieldKey="description" highlightedFields={highlightedFields}>
              <div>
                <label className={cn("font-medium text-sm", highlightedFields?.includes("description") ? "text-destructive" : "text-muted-foreground")}>
                  {isEvent ? "Event Details" : isScholarship ? "Scholarship Details" : "Donation Details"}
                </label>
                <p className="text-base mt-1">{donation.description || "No description provided"}</p>
              </div>
            </FieldWrapper>
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
            <FieldWrapper fieldKey="amount_needed" highlightedFields={highlightedFields}>
              <div>
                <label className={cn("font-medium text-sm", highlightedFields?.includes("amount_needed") ? "text-destructive" : "text-muted-foreground")}>
                  {isEvent ? "Volunteer Hours" : isScholarship ? "Scholarship Amount" : "Estimated Amount"}
                </label>
                <p className="text-base mt-1">
                  {formatAmount(donation.amount_needed)}
                </p>
              </div>
            </FieldWrapper>
          )}

          {/* Donation Type */}
          {isDonationView && donationType && (
            <FieldWrapper fieldKey="donation_type" highlightedFields={highlightedFields}>
              <div>
                <label className={cn("font-medium text-sm", highlightedFields?.includes("donation_type") ? "text-destructive" : "text-muted-foreground")}>Donation Type</label>
                <p className="text-base mt-1">{donationType}</p>
              </div>
            </FieldWrapper>
          )}

          {/* Physical goods fields */}
          {isDonationView && isPhysical && donation.material_type && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Material Type</label>
              <p className="text-base mt-1">{donation.material_type}</p>
            </div>
          )}
          {isDonationView && isPhysical && Number(donation.weight) > 0 && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Weight of Donation</label>
              <p className="text-base mt-1">{donation.weight} lbs</p>
            </div>
          )}
          {isDonationView && isPhysical && Number(d.quantity) > 0 && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Quantity</label>
              <p className="text-base mt-1">{d.quantity}</p>
            </div>
          )}
          {isDonationView && isPhysical && Number(d.dimensions) > 0 && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Dimensions</label>
              <p className="text-base mt-1">
                {d.dimensions} {d.dimension_unit === "square_feet" ? "sq ft" : d.dimension_unit === "linear_feet" ? "linear ft" : ""}
              </p>
            </div>
          )}

          {/* Professional Services fields */}
          {isDonationView && isServices && d.service_type && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Service Type</label>
              <p className="text-base mt-1">{d.service_type}</p>
            </div>
          )}
          {isDonationView && isServices && Number(d.hours_available) > 0 && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Hours Available</label>
              <p className="text-base mt-1">{d.hours_available} hours</p>
            </div>
          )}

          {/* Transportation / Equipment fields */}
          {isDonationView && isTransportation && d.equipment_type && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Equipment Type</label>
              <p className="text-base mt-1">{d.equipment_type}</p>
            </div>
          )}
          {isDonationView && isTransportation && Number(d.mileage) > 0 && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Mileage</label>
              <p className="text-base mt-1">{d.mileage}</p>
            </div>
          )}

          {/* Facility Use fields */}
          {isDonationView && isFacility && d.facility_type && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Facility Type</label>
              <p className="text-base mt-1">{d.facility_type}</p>
            </div>
          )}
          {isDonationView && isFacility && Number(d.capacity) > 0 && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Capacity</label>
              <p className="text-base mt-1">{d.capacity} people</p>
            </div>
          )}
          {isDonationView && isFacility && d.location && (
            <FieldWrapper fieldKey="location" highlightedFields={highlightedFields}>
              <div>
                <label className={cn("font-medium text-sm", highlightedFields?.includes("location") ? "text-destructive" : "text-muted-foreground")}>Location</label>
                <p className="text-base mt-1">{d.location}</p>
              </div>
            </FieldWrapper>
          )}

          {/* Contact info */}
          {donation.contact_email && (
            <FieldWrapper fieldKey="contact_email" highlightedFields={highlightedFields}>
              <div>
                <label className={cn("font-medium text-sm", highlightedFields?.includes("contact_email") ? "text-destructive" : "text-muted-foreground")}>Contact Email</label>
                <p className="text-base mt-1">{donation.contact_email}</p>
              </div>
            </FieldWrapper>
          )}
          {donation.contact_phone && (
            <FieldWrapper fieldKey="contact_phone" highlightedFields={highlightedFields}>
              <div>
                <label className={cn("font-medium text-sm", highlightedFields?.includes("contact_phone") ? "text-destructive" : "text-muted-foreground")}>Contact Phone</label>
                <p className="text-base mt-1">{donation.contact_phone}</p>
              </div>
            </FieldWrapper>
          )}
          {donation.target_date && (
            <FieldWrapper fieldKey="target_date" highlightedFields={highlightedFields}>
              <div>
                <label className={cn("font-medium text-sm", highlightedFields?.includes("target_date") ? "text-destructive" : "text-muted-foreground")}>Deadline</label>
                <p className="text-base mt-1">{formatDate(donation.target_date)}</p>
              </div>
            </FieldWrapper>
          )}
          {isDonationView && donation.can_deliver && (
            <div>
              <label className="font-medium text-sm text-muted-foreground">Can Deliver</label>
              <p className="text-base mt-1">
                {donation.delivery_miles ? `Up to ${donation.delivery_miles} miles` : 'Yes'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
