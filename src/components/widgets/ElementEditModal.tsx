
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ElementEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  element: any;
  onSave: (element: any) => void;
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

const OPERATORS = [
  { id: '+', label: 'Add (+)' },
  { id: '-', label: 'Subtract (-)' },
  { id: '*', label: 'Multiply (×)' },
  { id: '/', label: 'Divide (÷)' },
];

export const ElementEditModal = ({ open, onOpenChange, element, onSave }: ElementEditModalProps) => {
  const [editedElement, setEditedElement] = useState<any>({});

  useEffect(() => {
    if (element) {
      setEditedElement({ ...element });
    }
  }, [element]);

  const handleSave = () => {
    onSave(editedElement);
    onOpenChange(false);
  };

  const updateElement = (updates: any) => {
    setEditedElement({ ...editedElement, ...updates });
  };

  if (!element) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Element</DialogTitle>
          <DialogDescription>
            Modify the selected equation element.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Element Type</Label>
            <Select
              value={editedElement.type || ''}
              onValueChange={(value) => updateElement({ type: value, id: '', operator: '+', value: 0 })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value">Database Value</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="number">Custom Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editedElement.type === 'value' && (
            <div className="space-y-2">
              <Label>Database Value</Label>
              <Select
                value={editedElement.id || ''}
                onValueChange={(value) => updateElement({ id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a database value" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_VALUES.map((value) => (
                    <SelectItem key={value.id} value={value.id}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {editedElement.type === 'operator' && (
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select
                value={editedElement.operator || ''}
                onValueChange={(value) => updateElement({ operator: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {editedElement.type === 'number' && (
            <div className="space-y-2">
              <Label>Number Value</Label>
              <Input
                type="number"
                value={editedElement.value || 0}
                onChange={(e) => updateElement({ value: parseFloat(e.target.value) || 0 })}
                placeholder="Enter a number"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
