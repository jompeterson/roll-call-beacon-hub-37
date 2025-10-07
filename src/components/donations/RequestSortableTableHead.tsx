
import { ChevronUp, ChevronDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

type SortDirection = "asc" | "desc" | null;
type RequestSortField = "organization_name" | "request_type" | "title" | "description" | "status" | null;

interface RequestSortableTableHeadProps {
  children: React.ReactNode;
  field: RequestSortField;
  currentSort: RequestSortField;
  currentDirection: SortDirection;
  onSort: (field: RequestSortField) => void;
  className?: string;
}

export const RequestSortableTableHead = ({ 
  children, 
  field, 
  currentSort, 
  currentDirection, 
  onSort,
  className = ""
}: RequestSortableTableHeadProps) => {
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
