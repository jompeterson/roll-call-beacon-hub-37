
import { TableHead } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "contact" | "type" | "status" | null;

interface OrganizationSortableTableHeadProps { 
  children: React.ReactNode;
  field: SortField;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

export const OrganizationSortableTableHead = ({ 
  children, 
  field, 
  currentSort, 
  currentDirection, 
  onSort,
  className = ""
}: OrganizationSortableTableHeadProps) => {
  const isActive = currentSort === field;
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-[#0d5f56] select-none text-white ${className}`}
      style={{ backgroundColor: "#0f6e62" }}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-between">
        <span>{children}</span>
        <div className="ml-2">
          {isActive && currentDirection === "asc" && <ChevronUp className="h-4 w-4" />}
          {isActive && currentDirection === "desc" && <ChevronDown className="h-4 w-4" />}
          {!isActive && <div className="h-4 w-4" />}
        </div>
      </div>
    </TableHead>
  );
};
