
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<boolean>;
  submitting: boolean;
  placeholder?: string;
}

export const CommentForm = ({ 
  onSubmit, 
  submitting, 
  placeholder = "Write a comment..." 
}: CommentFormProps) => {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    const success = await onSubmit(content);
    if (success) {
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[100px]"
        disabled={submitting}
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Press Cmd/Ctrl + Enter to post
        </span>
        <Button 
          onClick={handleSubmit} 
          disabled={submitting || !content.trim()}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {submitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </div>
  );
};
