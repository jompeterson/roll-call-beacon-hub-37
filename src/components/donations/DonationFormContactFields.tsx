
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DonationFormContactFieldsProps {
  formData: {
    contact_email: string;
    contact_phone: string;
    donation_link: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const DonationFormContactFields = ({ formData, onInputChange }: DonationFormContactFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="contact_email">Contact Email</Label>
        <Input
          id="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => onInputChange("contact_email", e.target.value)}
          placeholder="contact@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_phone">Contact Phone</Label>
        <Input
          id="contact_phone"
          type="tel"
          value={formData.contact_phone}
          onChange={(e) => onInputChange("contact_phone", e.target.value)}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="donation_link">Donation Link</Label>
        <Input
          id="donation_link"
          type="url"
          value={formData.donation_link}
          onChange={(e) => onInputChange("donation_link", e.target.value)}
          placeholder="https://example.com/donate"
        />
      </div>
    </>
  );
};
