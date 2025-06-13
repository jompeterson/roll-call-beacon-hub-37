
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

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

const FILTER_FIELDS = {
  donations: [
    { id: 'is_approved', label: 'Approval Status', type: 'boolean' },
    { id: 'approval_decision_made', label: 'Decision Made', type: 'boolean' },
    { id: 'organization_id', label: 'Organization', type: 'text' },
    { id: 'amount_needed', label: 'Amount Needed', type: 'number' },
    { id: 'weight', label: 'Weight', type: 'number' },
    { id: 'created_at', label: 'Created Date', type: 'date' },
  ],
  requests: [
    { id: 'is_approved', label: 'Approval Status', type: 'boolean' },
    { id: 'approval_decision_made', label: 'Decision Made', type: 'boolean' },
    { id: 'is_completed', label: 'Completion Status', type: 'boolean' },
    { id: 'organization_id', label: 'Organization', type: 'text' },
    { id: 'urgency_level', label: 'Urgency Level', type: 'text' },
    { id: 'request_type', label: 'Request Type', type: 'text' },
    { id: 'created_at', label: 'Created Date', type: 'date' },
  ],
  scholarships: [
    { id: 'is_approved', label: 'Approval Status', type: 'boolean' },
    { id: 'approval_decision_made', label: 'Decision Made', type: 'boolean' },
    { id: 'organization_id', label: 'Organization', type: 'text' },
    { id: 'amount', label: 'Amount', type: 'number' },
    { id: 'created_at', label: 'Created Date', type: 'date' },
  ],
  events: [
    { id: 'is_approved', label: 'Approval Status', type: 'boolean' },
    { id: 'approval_decision_made', label: 'Decision Made', type: 'boolean' },
    { id: 'max_participants', label: 'Max Participants', type: 'number' },
    { id: 'event_date', label: 'Event Date', type: 'date' },
    { id: 'created_at', label: 'Created Date', type: 'date' },
  ],
};

const FILTER_OPERATORS = [
  { id: 'equals', label: 'Equals (=)' },
  { id: 'not_equals', label: 'Not Equals (≠)' },
  { id: 'greater_than', label: 'Greater Than (>)' },
  { id: 'less_than', label: 'Less Than (<)' },
  { id: 'greater_equal', label: 'Greater or Equal (≥)' },
  { id: 'less_equal', label: 'Less or Equal (≤)' },
  { id: 'contains', label: 'Contains' },
];

export const ElementEditModal = ({ open, onOpenChange, element, onSave }: ElementEditModalProps) => {
  const [editedElement, setEditedElement] = useState<any>({});

  useEffect(() => {
    if (element) {
      setEditedElement({ 
        ...element,
        filters: element.filters || []
      });
    }
  }, [element]);

  const handleSave = () => {
    onSave(editedElement);
    onOpenChange(false);
  };

  const updateElement = (updates: any) => {
    setEditedElement({ ...editedElement, ...updates });
  };

  const addFilter = () => {
    const newFilter = {
      field: '',
      operator: 'equals',
      value: ''
    };
    const currentFilters = editedElement.filters || [];
    updateElement({ filters: [...currentFilters, newFilter] });
  };

  const updateFilter = (index: number, filter: any) => {
    const newFilters = [...(editedElement.filters || [])];
    newFilters[index] = filter;
    updateElement({ filters: newFilters });
  };

  const removeFilter = (index: number) => {
    const newFilters = (editedElement.filters || []).filter((_: any, i: number) => i !== index);
    updateElement({ filters: newFilters });
  };

  const getAvailableFields = () => {
    if (editedElement.type !== 'value' || !editedElement.id) return [];
    
    const selectedValue = PREDEFINED_VALUES.find(v => v.id === editedElement.id);
    if (!selectedValue) return [];
    
    return FILTER_FIELDS[selectedValue.category as keyof typeof FILTER_FIELDS] || [];
  };

  const getFieldType = (fieldId: string) => {
    const availableFields = getAvailableFields();
    const field = availableFields.find(f => f.id === fieldId);
    return field?.type || 'text';
  };

  if (!element) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Element</DialogTitle>
          <DialogDescription>
            Modify the selected equation element and add filters to refine the data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Element Type</Label>
            <Select
              value={editedElement.type || ''}
              onValueChange={(value) => updateElement({ type: value, id: '', operator: '+', value: 0, filters: [] })}
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
                onValueChange={(value) => updateElement({ id: value, filters: [] })}
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

          {/* Filters Section */}
          {editedElement.type === 'value' && editedElement.id && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Filters</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFilter}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Filter
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Add filters to refine which records are included in the calculation.
              </p>

              {editedElement.filters?.map((filter: any, index: number) => (
                <div key={index} className="space-y-3 p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Filter {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Field</Label>
                      <Select
                        value={filter.field || ''}
                        onValueChange={(value) => updateFilter(index, { ...filter, field: value, value: '' })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableFields().map((field) => (
                            <SelectItem key={field.id} value={field.id}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Operator</Label>
                      <Select
                        value={filter.operator || 'equals'}
                        onValueChange={(value) => updateFilter(index, { ...filter, operator: value })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FILTER_OPERATORS.map((op) => (
                            <SelectItem key={op.id} value={op.id}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Value</Label>
                      {getFieldType(filter.field) === 'boolean' ? (
                        <Select
                          value={filter.value || ''}
                          onValueChange={(value) => updateFilter(index, { ...filter, value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          className="h-8"
                          type={getFieldType(filter.field) === 'number' ? 'number' : getFieldType(filter.field) === 'date' ? 'date' : 'text'}
                          value={filter.value || ''}
                          onChange={(e) => updateFilter(index, { ...filter, value: e.target.value })}
                          placeholder="Enter value"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!editedElement.filters || editedElement.filters.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No filters added. Click "Add Filter" to refine your calculation.
                </p>
              )}
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
