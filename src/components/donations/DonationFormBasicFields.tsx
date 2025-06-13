
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DonationFormBasicFieldsProps {
  formData: {
    title: string;
    estimated_value: string;
    donation_type: string;
    target_date: string;
    weight: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const DonationFormBasicFields = ({ formData, onInputChange }: DonationFormBasicFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onInputChange("title", e.target.value)}
          placeholder="Enter donation title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimated_value">Estimated Value *</Label>
        <Input
          id="estimated_value"
          type="number"
          step="0.01"
          min="0"
          value={formData.estimated_value}
          onChange={(e) => onInputChange("estimated_value", e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="donation_type">Donation Type *</Label>
        <Select value={formData.donation_type} onValueChange={(value) => onInputChange("donation_type", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select donation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tools">Tools</SelectItem>
            <SelectItem value="Materials">Materials</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">Weight (lbs)</Label>
        <Input
          id="weight"
          type="number"
          step="0.01"
          min="0"
          value={formData.weight}
          onChange={(e) => onInputChange("weight", e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="target_date">Deadline</Label>
        <Input
          id="target_date"
          type="date"
          value={formData.target_date}
          onChange={(e) => onInputChange("target_date", e.target.value)}
        />
      </div>
    </div>
  );
};
