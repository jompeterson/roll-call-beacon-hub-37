import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MarkFulfilledButtonProps {
  /** "donations" or "requests" */
  table: "donations" | "requests";
  /** Column that stores the fulfilled state */
  column: "is_taken" | "is_completed";
  recordId: string;
  isFulfilled: boolean;
  markLabel: string;
  undoLabel: string;
  successMessage: string;
  undoMessage: string;
  /** Only admins can undo */
  canUndo?: boolean;
}

export const MarkFulfilledButton = ({
  table,
  column,
  recordId,
  isFulfilled,
  markLabel,
  undoLabel,
  successMessage,
  undoMessage,
  canUndo = false,
}: MarkFulfilledButtonProps) => {
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const update = async (value: boolean) => {
    setSaving(true);
    const { error } = await supabase
      .from(table)
      .update({ [column]: value } as never)
      .eq("id", recordId);
    setSaving(false);

    if (error) {
      toast({
        title: "Something went wrong",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: [table] });
    toast({ title: value ? successMessage : undoMessage });
  };

  if (isFulfilled) {
    if (!canUndo) return null;
    return (
      <Button variant="outline" onClick={() => update(false)} disabled={saving}>
        <RotateCcw className="w-4 h-4 mr-2" />
        {undoLabel}
      </Button>
    );
  }

  return (
    <Button
      onClick={() => update(true)}
      disabled={saving}
      style={{ backgroundColor: "#3d7471" }}
      className="text-white hover:opacity-90"
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      {markLabel}
    </Button>
  );
};
