
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Edit, Trash2, Reply } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Comment } from "@/hooks/useComments";

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => Promise<boolean>;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<boolean>;
  submitting: boolean;
  depth?: number;
}

export const CommentItem = ({ 
  comment, 
  onReply, 
  onEdit, 
  onDelete, 
  submitting,
  depth = 0 
}: CommentItemProps) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = user?.id === comment.creator_user_id;
  const maxDepth = 3; // Limit nesting depth

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    const success = await onReply(comment.id, replyContent);
    if (success) {
      setReplyContent("");
      setIsReplying(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    const success = await onEdit(comment.id, editContent);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await onDelete(comment.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`space-y-3 ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="font-medium text-sm">{comment.creator_name}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {formatDate(comment.created_at)}
              {comment.updated_at !== comment.created_at && ' (edited)'}
            </span>
          </div>
          
          {isOwner && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={submitting}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={submitting}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Edit your comment..."
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit} disabled={submitting}>
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            
            {depth < maxDepth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                className="mt-2 text-xs"
                disabled={submitting}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </>
        )}

        {isReplying && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReply} disabled={submitting || !replyContent.trim()}>
                Reply
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent("");
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              submitting={submitting}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
