
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScholarshipFormData } from "./ScholarshipFormData";
import { ImageUpload } from "@/components/shared/ImageUpload";

interface ScholarshipFormFieldsProps {
  formData: ScholarshipFormData;
  images: File[];
  onInputChange: (field: string, value: string) => void;
  onImagesChange: (images: File[]) => void;
}

export const ScholarshipFormFields = ({ formData, images, onInputChange, onImagesChange }: ScholarshipFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Scholarship Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onInputChange("title", e.target.value)}
            placeholder="Enter scholarship title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => onInputChange("amount", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="application_deadline">Application Deadline</Label>
          <Input
            id="application_deadline"
            type="date"
            value={formData.application_deadline}
            onChange={(e) => onInputChange("application_deadline", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scholarship_link">Scholarship Link</Label>
          <Input
            id="scholarship_link"
            type="url"
            value={formData.scholarship_link}
            onChange={(e) => onInputChange("scholarship_link", e.target.value)}
            placeholder="https://example.com/scholarship-application"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Describe the scholarship program..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
        <Textarea
          id="eligibility_criteria"
          value={formData.eligibility_criteria}
          onChange={(e) => onInputChange("eligibility_criteria", e.target.value)}
          placeholder="List the eligibility requirements..."
          rows={3}
        />
      </div>

      <ImageUpload 
        images={images}
        onImagesChange={onImagesChange}
        label="Scholarship Images"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </div>
  );
};
