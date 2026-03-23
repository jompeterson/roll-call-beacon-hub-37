
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
    material_type: string;
    service_type?: string;
    hours_available?: string;
    equipment_type?: string;
    mileage?: string;
    facility_type?: string;
    capacity?: string;
    location?: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const DonationFormBasicFields = ({ formData, onInputChange }: DonationFormBasicFieldsProps) => {
  const donationType = formData.donation_type;

  const isPhysicalGoods = donationType === "Tools" || donationType === "Materials" || donationType === "Other";
  const isServices = donationType === "Professional Services / Labor";
  const isTransportation = donationType === "Transportation / Equipment Use";
  const isFacility = donationType === "Facility Use";

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
            <SelectItem value="Professional Services / Labor">Professional Services / Labor</SelectItem>
            <SelectItem value="Transportation / Equipment Use">Transportation / Equipment Use</SelectItem>
            <SelectItem value="Facility Use">Facility Use</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_date">Deadline</Label>
        <Input
          id="target_date"
          type="date"
          value={formData.target_date}
          onChange={(e) => onInputChange("target_date", e.target.value)}
        />
      </div>

      {/* Physical goods fields */}
      {isPhysicalGoods && (
        <>
          <div className="space-y-2">
            <Label htmlFor="material_type">Material Type</Label>
            <Select value={formData.material_type} onValueChange={(value) => onInputChange("material_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Wood">Wood</SelectItem>
                <SelectItem value="Metal">Metal</SelectItem>
                <SelectItem value="Plastic">Plastic</SelectItem>
                <SelectItem value="Glass">Glass</SelectItem>
                <SelectItem value="Fabric">Fabric</SelectItem>
                <SelectItem value="Paper">Paper</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Books">Books</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Sports Equipment">Sports Equipment</SelectItem>
                <SelectItem value="Toys">Toys</SelectItem>
                <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                <SelectItem value="Office Supplies">Office Supplies</SelectItem>
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
        </>
      )}

      {/* Professional Services fields */}
      {isServices && (
        <>
          <div className="space-y-2">
            <Label htmlFor="service_type">Service Type</Label>
            <Select value={formData.service_type || ""} onValueChange={(value) => onInputChange("service_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Carpentry">Carpentry</SelectItem>
                <SelectItem value="Painting">Painting</SelectItem>
                <SelectItem value="Landscaping">Landscaping</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Accounting">Accounting</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
                <SelectItem value="IT / Tech Support">IT / Tech Support</SelectItem>
                <SelectItem value="Tutoring / Teaching">Tutoring / Teaching</SelectItem>
                <SelectItem value="Medical / Health">Medical / Health</SelectItem>
                <SelectItem value="Design / Creative">Design / Creative</SelectItem>
                <SelectItem value="General Labor">General Labor</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours_available">Hours Available</Label>
            <Input
              id="hours_available"
              type="number"
              step="0.5"
              min="0"
              value={formData.hours_available || ""}
              onChange={(e) => onInputChange("hours_available", e.target.value)}
              placeholder="Number of hours"
            />
          </div>
        </>
      )}

      {/* Transportation / Equipment Use fields */}
      {isTransportation && (
        <>
          <div className="space-y-2">
            <Label htmlFor="equipment_type">Equipment Type</Label>
            <Select value={formData.equipment_type || ""} onValueChange={(value) => onInputChange("equipment_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Truck">Truck</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
                <SelectItem value="Trailer">Trailer</SelectItem>
                <SelectItem value="Forklift">Forklift</SelectItem>
                <SelectItem value="Crane">Crane</SelectItem>
                <SelectItem value="Excavator">Excavator</SelectItem>
                <SelectItem value="Generator">Generator</SelectItem>
                <SelectItem value="Power Tools">Power Tools</SelectItem>
                <SelectItem value="Construction Equipment">Construction Equipment</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage</Label>
            <Input
              id="mileage"
              type="number"
              step="0.1"
              min="0"
              value={formData.mileage || ""}
              onChange={(e) => onInputChange("mileage", e.target.value)}
              placeholder="Total mileage"
            />
          </div>
        </>
      )}

      {/* Facility Use fields */}
      {isFacility && (
        <>
          <div className="space-y-2">
            <Label htmlFor="facility_type">Facility Type</Label>
            <Select value={formData.facility_type || ""} onValueChange={(value) => onInputChange("facility_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select facility type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                <SelectItem value="Event Hall">Event Hall</SelectItem>
                <SelectItem value="Classroom">Classroom</SelectItem>
                <SelectItem value="Kitchen / Cafeteria">Kitchen / Cafeteria</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
                <SelectItem value="Office Space">Office Space</SelectItem>
                <SelectItem value="Outdoor Space">Outdoor Space</SelectItem>
                <SelectItem value="Gymnasium">Gymnasium</SelectItem>
                <SelectItem value="Parking Lot">Parking Lot</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (people)</Label>
            <Input
              id="capacity"
              type="number"
              min="0"
              value={formData.capacity || ""}
              onChange={(e) => onInputChange("capacity", e.target.value)}
              placeholder="Max capacity"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location">Location / Address</Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) => onInputChange("location", e.target.value)}
              placeholder="Facility address or location"
            />
          </div>
        </>
      )}
    </div>
  );
};
