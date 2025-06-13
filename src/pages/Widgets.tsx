import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { WidgetCreateModal } from "@/components/widgets/WidgetCreateModal";
import { WidgetEditModal } from "@/components/widgets/WidgetEditModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Widget {
  id: string;
  title: string;
  description?: string;
  section: 'pending_approvals' | 'monthly_metrics' | 'yearly_metrics';
  metrics: any[];
  display_config: any;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const Widgets = () => {
  const { toast } = useToast();
  const { isAdministrator } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_widgets')
        .select('*')
        .order('section', { ascending: true })
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching widgets:', error);
        toast({
          title: "Error",
          description: "Failed to load widgets. Please try again.",
          variant: "destructive",
        });
      } else {
        setWidgets((data || []) as Widget[]);
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
      toast({
        title: "Error",
        description: "Failed to load widgets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (widget: Widget) => {
    try {
      const { error } = await supabase
        .from('custom_widgets')
        .update({ is_active: !widget.is_active })
        .eq('id', widget.id);

      if (error) {
        console.error('Error updating widget:', error);
        toast({
          title: "Error",
          description: "Failed to update widget status.",
          variant: "destructive",
        });
      } else {
        setWidgets(widgets.map(w => 
          w.id === widget.id ? { ...w, is_active: !w.is_active } : w
        ));
        toast({
          title: "Success",
          description: `Widget ${!widget.is_active ? 'activated' : 'deactivated'} successfully.`,
        });
      }
    } catch (error) {
      console.error('Error updating widget:', error);
      toast({
        title: "Error",
        description: "Failed to update widget status.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWidget = async (widget: Widget) => {
    if (!confirm('Are you sure you want to delete this widget?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_widgets')
        .delete()
        .eq('id', widget.id);

      if (error) {
        console.error('Error deleting widget:', error);
        toast({
          title: "Error",
          description: "Failed to delete widget.",
          variant: "destructive",
        });
      } else {
        setWidgets(widgets.filter(w => w.id !== widget.id));
        toast({
          title: "Success",
          description: "Widget deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast({
        title: "Error",
        description: "Failed to delete widget.",
        variant: "destructive",
      });
    }
  };

  const getSectionDisplayName = (section: string) => {
    switch (section) {
      case 'pending_approvals':
        return 'Pending Approvals';
      case 'monthly_metrics':
        return 'Monthly Metrics';
      case 'yearly_metrics':
        return 'Yearly Metrics';
      default:
        return section;
    }
  };

  if (!isAdministrator) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page. Only administrators can manage widgets.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Widgets Management</h1>
          <p className="text-muted-foreground">
            Create and manage custom widgets for the Overview page
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Widget
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Widgets</CardTitle>
          <CardDescription>
            Manage widgets that appear on the Overview page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {widgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No custom widgets created yet.</p>
              <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                Create Your First Widget
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {widgets.map((widget) => (
                  <TableRow key={widget.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{widget.title}</div>
                        {widget.description && (
                          <div className="text-sm text-muted-foreground">
                            {widget.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getSectionDisplayName(widget.section)}
                      </Badge>
                    </TableCell>
                    <TableCell>{widget.position}</TableCell>
                    <TableCell>
                      <Badge variant={widget.is_active ? "default" : "secondary"}>
                        {widget.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(widget.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(widget)}
                        >
                          {widget.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingWidget(widget)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWidget(widget)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <WidgetCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          fetchWidgets();
          setShowCreateModal(false);
        }}
      />

      {editingWidget && (
        <WidgetEditModal
          widget={editingWidget}
          open={!!editingWidget}
          onOpenChange={(open) => !open && setEditingWidget(null)}
          onSuccess={() => {
            fetchWidgets();
            setEditingWidget(null);
          }}
        />
      )}
    </div>
  );
};
