import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DimensionsInputProps {
  value: string;
  unit: string;
  onValueChange: (value: string) => void;
  onUnitChange: (unit: string) => void;
  label?: string;
  className?: string;
}

export const DimensionsInput = ({
  value,
  unit,
  onValueChange,
  onUnitChange,
  label = "Dimensions (optional)",
  className,
}: DimensionsInputProps) => {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor="dimensions">{label}</Label>
      <div className="flex gap-0">
        <Input
          id="dimensions"
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="0.00"
          className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Select value={unit} onValueChange={onUnitChange}>
          <SelectTrigger className="w-[160px] rounded-l-none border-l-0 shrink-0">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear_feet">Linear Feet</SelectItem>
            <SelectItem value="square_feet">Square Feet</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
