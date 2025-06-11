
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DonationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const DonationFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}: DonationFiltersProps) => {
  return (
    <div className="flex gap-4 items-center">
      <div className="flex-1">
        <Input
          placeholder="Search for donations..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Approved">Approved</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Rejected">Rejected</SelectItem>
          <SelectItem value="Archived">Archived</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
