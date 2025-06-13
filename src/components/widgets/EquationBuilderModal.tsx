
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, X, Edit } from "lucide-react";
import { ElementEditModal } from "./ElementEditModal";

interface EquationBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (equation: any) => void;
  initialEquation?: any;
}

const PREDEFINED_VALUES = [
  { id: 'donations_count', label: 'Total Donations Count', category: 'donations' },
  { id: 'donations_amount', label: 'Total Donations Amount', category: 'donations' },
  { id: 'donations_weight', label: 'Total Donations Weight', category: 'donations' },
  { id: 'donations_approved', label: 'Approved Donations Count', category: 'donations' },
  { id: 'donations_pending', label: 'Pending Donations Count', category: 'donations' },
  { id: 'requests_count', label: 'Total Requests Count', category: 'requests' },
  { id: 'requests_approved', label: 'Approved Requests Count', category: 'requests' },
  { id: 'requests_pending', label: 'Pending Requests Count', category: 'requests' },
  { id: 'requests_completed', label: 'Completed Requests Count', category: 'requests' },
  { id: 'scholarships_count', label: 'Total Scholarships Count', category: 'scholarships' },
  { id: 'scholarships_amount', label: 'Total Scholarships Amount', category: 'scholarships' },
  { id: 'scholarships_approved', label: 'Approved Scholarships Count', category: 'scholarships' },
  { id: 'scholarships_pending', label: 'Pending Scholarships Count', category: 'scholarships' },
  { id: 'events_count', label: 'Total Events Count', category: 'events' },
  { id: 'events_approved', label: 'Approved Events Count', category: 'events' },
  { id: 'events_pending', label: 'Pending Events Count', category: 'events' },
];

export const EquationBuilderModal = ({ open, onOpenChange, onSave, initialEquation }: EquationBuilderModalProps) => {
  const [equation, setEquation] = useState<any[]>([]);
  const [editingElement, setEditingElement] = useState<{ element: any; index: number } | null>(null);

  useEffect(() => {
    if (initialEquation && initialEquation.length > 0) {
      setEquation(initialEquation);
    } else {
      setEquation([{ type: 'value', id: '', value: 0 }]);
    }
  }, [initialEquation, open]);

  const addElement = (type: 'value' | 'operator' | 'number') => {
    const newElement = type === 'value' 
      ? { type: 'value', id: '', value: 0 }
      : type === 'operator'
      ? { type: 'operator', operator: '+' }
      : { type: 'number', value: 0 };
    
    setEquation([...equation, newElement]);
  };

  const updateElement = (index: number, updatedElement: any) => {
    const newEquation = [...equation];
    newEquation[index] = updatedElement;
    setEquation(newEquation);
  };

  const removeElement = (index: number) => {
    if (equation.length > 1) {
      const newEquation = equation.filter((_, i) => i !== index);
      setEquation(newEquation);
    }
  };

  const handleSave = () => {
    onSave(equation);
    onOpenChange(false);
  };

  const getElementDisplay = (element: any) => {
    if (element.type === 'value') {
      const predefined = PREDEFINED_VALUES.find(v => v.id === element.id);
      return predefined ? predefined.label : 'Select Value';
    } else if (element.type === 'operator') {
      return element.operator;
    } else if (element.type === 'number') {
      return element.value.toString();
    }
    return '';
  };

  const handleElementClick = (element: any, index: number) => {
    setEditingElement({ element, index });
  };

  const handleElementSave = (updatedElement: any) => {
    if (editingElement) {
      updateElement(editingElement.index, updatedElement);
      setEditingElement(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Build Calculation Equation</DialogTitle>
            <DialogDescription>
              Create a custom equation using predefined database values, operators, and custom numbers. Click on any element to edit it.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <Label className="text-sm font-medium">Current Equation</Label>
              <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] items-center">
                {equation.map((element, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <Badge 
                      variant="outline" 
                      className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleElementClick(element, index)}
                    >
                      <Edit className="h-3 w-3" />
                      {getElementDisplay(element)}
                      {equation.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeElement(index);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Click on any element above to edit it, or use the buttons below to add new elements.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => addElement('value')}>
                <Plus className="h-4 w-4 mr-1" />
                Add Value
              </Button>
              <Button variant="outline" onClick={() => addElement('operator')}>
                <Plus className="h-4 w-4 mr-1" />
                Add Operator
              </Button>
              <Button variant="outline" onClick={() => addElement('number')}>
                <Plus className="h-4 w-4 mr-1" />
                Add Number
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save Equation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ElementEditModal
        open={!!editingElement}
        onOpenChange={(open) => !open && setEditingElement(null)}
        element={editingElement?.element}
        onSave={handleElementSave}
      />
    </>
  );
};
