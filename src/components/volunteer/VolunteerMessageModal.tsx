import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Underline, List, ListOrdered, Heading2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VolunteerMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteerId: string;
  volunteerTitle: string;
}

export const VolunteerMessageModal = ({
  open,
  onOpenChange,
  volunteerId,
  volunteerTitle,
}: VolunteerMessageModalProps) => {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [subject, setSubject] = useState(`Thank you for volunteering: ${volunteerTitle}`);
  const [sending, setSending] = useState(false);

  const format = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command);
  };

  const handleSend = async () => {
    const messageHtml = editorRef.current?.innerHTML?.trim() || "";
    const messageText = editorRef.current?.innerText?.trim() || "";

    if (!subject.trim()) {
      toast({ title: "Subject required", description: "Please add a subject line.", variant: "destructive" });
      return;
    }
    if (!messageText) {
      toast({ title: "Message required", description: "Please write a message.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const sessionToken = localStorage.getItem("session_token");
      const { data, error } = await supabase.functions.invoke("send-volunteer-message", {
        body: { sessionToken, volunteerId, subject: subject.trim(), messageHtml },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({
        title: "Message sent",
        description: `Your message was emailed to ${(data as any)?.sent ?? 0} participant(s).`,
      });
      onOpenChange(false);
      if (editorRef.current) editorRef.current.innerHTML = "";
    } catch (err: any) {
      console.error("Failed to send volunteer message:", err);
      toast({
        title: "Failed to send",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Message Participants</DialogTitle>
          <DialogDescription>
            Send a formatted email to everyone who showed interest in "{volunteerTitle}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message-subject">Subject</Label>
            <Input
              id="message-subject"
              value={subject}
              maxLength={200}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <div className="rounded-md border">
              <div className="flex flex-wrap items-center gap-1 border-b p-1">
                <Toggle size="sm" aria-label="Bold" onPressedChange={() => format("bold")}>
                  <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" aria-label="Italic" onPressedChange={() => format("italic")}>
                  <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" aria-label="Underline" onPressedChange={() => format("underline")}>
                  <Underline className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" aria-label="Heading" onPressedChange={() => document.execCommand("formatBlock", false, "h3")}>
                  <Heading2 className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" aria-label="Bulleted list" onPressedChange={() => format("insertUnorderedList")}>
                  <List className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm" aria-label="Numbered list" onPressedChange={() => format("insertOrderedList")}>
                  <ListOrdered className="h-4 w-4" />
                </Toggle>
              </div>
              <div
                ref={editorRef}
                contentEditable
                role="textbox"
                aria-label="Message body"
                className="min-h-[180px] max-h-[320px] overflow-y-auto p-3 text-sm outline-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_h3]:font-semibold [&_h3]:text-base"
                suppressContentEditableWarning
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Basic formatting (bold, italics, underline, headings, lists) is supported.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
