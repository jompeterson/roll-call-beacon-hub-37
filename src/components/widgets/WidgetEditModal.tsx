
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EquationBuilderModal } from "./EquationBuilderModal";
import { Calculator } from "lucide-react";

interface Widget {
  id: string;
  title: string;
  description?: string;
  section: 'pending_approvals' | 'monthly_metrics' | 'yearly_metrics';
  metrics: any[];
  display_config: any;
  position: number;
  is_active: boolean;
}

interface WidgetEditModalProps {
  widget: Widget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const VALUE_FORMATS = [
  { id: 'number', label: 'Number (1,234)' },
  { id: 'currency', label: 'Currency ($1,234)' },
  { id: 'percentage', label: 'Percentage (12.34%)' },
  { id: 'decimal', label: 'Decimal (1234.56)' },
];

export const WidgetEditModal = ({ widget, open, onOpenChange, onSuccess }: WidgetEditModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showEquationBuilder, setShowEquationBuilder] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    section: "",
    position: 0,
    equation: [],
    valueFormat: "number",
  });

  useEffect(() => {
    if (widget) {
      setFormData({
        title: widget.title,
        description: widget.description || "",
        section: widget.section,
        position: widget.position,
        equation: widget.display_config?.equation || [],
        valueFormat: widget.display_config?.valueFormat || "number",
      });
    }
  }, [widget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.section) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('custom_widgets' as any)
        .update({
          title: formData.title,
          description: formData.description || null,
          section: formData.section,
          position: formData.position,
          display_config: {
            ...widget.display_config,
            equation: formData.equation,
            valueFormat: formData.valueFormat,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', widget.id);

      if (error) {
        console.error('Error updating widget:', error);
        toast({
          title: "Error",
          description: "Failed to update widget. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Widget updated successfully.",
        });
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating widget:', error);
      toast({
        title: "Error",
        description: "Failed to update widget. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEquationSave = (equation: any) => {
    setFormData({ ...formData, equation });
  };

  const getEquationPreview = () => {
    if (!formData.equation || formData.equation.length === 0) {
      return "No calculation defined";
    }
    return formData.equation.map((element: any) => {
      if (element.type === 'value') {
        return element.id || 'Value';
      } else if (element.type === 'operator') {
        return element.operator;
      } else if (element.type === 'number') {
        return element.value.toString();
      }
      return '';
    }).join(' ');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Widget</DialogTitle>
            <DialogDescription>
              Update the widget configuration.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Widget Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter widget title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section *</Label>
              <Select
                value={formData.section}
                onValueChange={(value) => setFormData({ ...formData, section: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_approvals">Pending Approvals</SelectItem>
                  <SelectItem value="monthly_metrics">Monthly Metrics</SelectItem>
                  <SelectItem value="yearly_metrics">Yearly Metrics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Calculation</Label>
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="text-sm text-gray-600 mb-2">
                  {getEquationPreview()}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEquationBuilder(true)}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Configure Calculation
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valueFormat">Value Format</Label>
              <Select
                value={formData.valueFormat}
                onValueChange={(value) => setFormData({ ...formData, valueFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VALUE_FORMATS.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Widget"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <EquationBuilderModal
        open={showEquationBuilder}
        onOpenChange={setShowEquationBuilder}
        onSave={handleEquationSave}
        initialEquation={formData.equation}
      />
    </>
  );
};
