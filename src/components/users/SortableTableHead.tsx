
import { ChevronUp, ChevronDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

type SortDirection = "asc" | "desc" | null;
type SortField = "firstName" | "lastName" | "organization" | "email" | "dateJoined" | "status" | null;

interface SortableTableHeadProps {
  children: React.ReactNode;
  field: SortField;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

export const SortableTableHead = ({ 
  children, 
  field, 
  currentSort, 
  currentDirection, 
  onSort,
  className = ""
}: SortableTableHeadProps) => {
  const isActive = currentSort === field;
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-[#1e3a52] select-none text-white ${className}`}
      style={{ backgroundColor: "#294865" }}
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
