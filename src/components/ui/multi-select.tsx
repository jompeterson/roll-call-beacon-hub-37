import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const remove = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== option));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal min-h-10 h-auto py-2",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              value.map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="gap-1"
                >
                  {v}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => remove(v, e)}
                    className="cursor-pointer hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <ScrollArea className="max-h-64">
          <div className="p-1">
            {options.map((option) => {
              const checked = value.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => toggle(option)}
                  className="flex items-center gap-2 px-2 py-2 rounded-sm cursor-pointer hover:bg-accent"
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggle(option)} />
                  <span className="flex-1 text-sm">{option}</span>
                  {checked && <Check className="h-4 w-4 text-primary" />}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
