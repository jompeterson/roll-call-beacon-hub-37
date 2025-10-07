
import { Separator } from "@/components/ui/separator";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/hooks/useComments";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

interface CommentsSectionProps {
  contentType: 'event' | 'scholarship' | 'donation' | 'request' | 'volunteer';
  contentId: string;
  title?: string;
}

export const CommentsSection = ({ 
  contentType, 
  contentId, 
  title = "Comments" 
}: CommentsSectionProps) => {
  const { isAuthenticated } = useAuth();
  const {
    comments,
    loading,
    submitting,
    createComment,
    updateComment,
    deleteComment
  } = useComments(contentType, contentId);

  const handleCreateComment = async (content: string) => {
    return await createComment(content);
  };

  const handleReply = async (parentId: string, content: string) => {
    return await createComment(content, parentId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Separator />
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Separator />
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-semibold text-lg">{title}</h3>
          <span className="text-sm text-muted-foreground">
            ({comments.length} {comments.length === 1 ? 'comment' : 'comments'})
          </span>
        </div>

        {isAuthenticated ? (
          <CommentForm
            onSubmit={handleCreateComment}
            submitting={submitting}
            placeholder="Share your thoughts..."
          />
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              Please log in to post comments and engage with the community.
            </p>
          </div>
        )}

        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={updateComment}
                onDelete={deleteComment}
                submitting={submitting}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No comments yet.</p>
            <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};
