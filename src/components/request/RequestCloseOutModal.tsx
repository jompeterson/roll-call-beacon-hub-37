import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dateInputToISO } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  onCompleted?: () => void;
}

const MAX_PHOTOS = 3;

export const RequestCloseOutModal = ({ open, onOpenChange, requestId, onCompleted }: Props) => {
  const [value, setValue] = useState("");
  const [handoffDate, setHandoffDate] = useState(new Date().toISOString().slice(0, 10));
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list).filter((f) => f.type.startsWith("image/"))];
    if (next.length > MAX_PHOTOS) toast({ title: `You can add up to ${MAX_PHOTOS} photos` });
    setFiles(next.slice(0, MAX_PHOTOS));
  };

  const submit = async () => {
    const amount = Number(value);
    if (value === "" || isNaN(amount) || amount < 0) {
      toast({ title: "Please enter the value of the request", variant: "destructive" });
      return;
    }
    if (!handoffDate) {
      toast({ title: "Please choose a handoff date", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `request-closeout/${requestId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("donation-images").upload(path, file);
        if (upErr) throw upErr;
        urls.push(supabase.storage.from("donation-images").getPublicUrl(path).data.publicUrl);
      }
      const { error } = await supabase
        .from("requests")
        .update({
          is_completed: true,
          completed_value: amount,
          handoff_date: dateInputToISO(handoffDate),
          completion_images: urls,
        } as never)
        .eq("id", requestId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request", requestId] });
      toast({ title: "Request closed out" });
      setFiles([]); setValue("");
      onOpenChange(false);
      onCompleted?.();
    } catch (e: any) {
      toast({ title: "Something went wrong", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen => !saving && onOpenChange(setOpen)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Close Out Request</DialogTitle>
          <DialogDescription>Record the details of this completed donation request.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="closeout-value">Value of the Request ($) *</Label>
            <Input id="closeout-value" type="number" min="0" step="0.01" value={value}
              onChange={(e) => setValue(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closeout-date">Handoff Date *</Label>
            <Input id="closeout-date" type="date" value={handoffDate}
              onChange={(e) => setHandoffDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Photos (optional, up to {MAX_PHOTOS})</Label>
            {files.length < MAX_PHOTOS && (
              <Input type="file" accept="image/*" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            )}
            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded overflow-hidden border">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving} style={{ backgroundColor: "#3d7471" }} className="text-white hover:opacity-90">
            {saving ? "Saving..." : "Complete Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
