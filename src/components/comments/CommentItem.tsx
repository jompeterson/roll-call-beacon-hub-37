
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Edit, Trash2, Reply, Save, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CommentForm } from "./CommentForm";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = user?.id === comment.creator_user_id;
  const maxDepth = 3; // Limit nesting depth

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    setIsSubmitting(true);
    const success = await onEdit(comment.id, editContent);
    setIsSubmitting(false);
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await onDelete(comment.id);
    }
  };

  const handleReply = async (content: string) => {
    const success = await onReply(comment.id, content);
    if (success) {
      setShowReplyForm(false);
    }
    return success;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`space-y-3 ${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="text-xs">
            {getInitials(comment.creator_name || 'Unknown')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">{comment.creator_name || 'Unknown User'}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
              {comment.updated_at !== comment.created_at && ' (edited)'}
            </span>
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={isSubmitting || !editContent.trim()}
                  className="flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={isSubmitting}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          )}
          
          {!isEditing && (
            <div className="flex items-center space-x-4 pt-1">
              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
              
              {isOwner && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}
          
          {showReplyForm && (
            <div className="mt-3 pt-3 border-t">
              <CommentForm
                onSubmit={handleReply}
                submitting={submitting}
                placeholder={`Reply to ${comment.creator_name}...`}
              />
            </div>
          )}
        </div>
      </div>
      
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
      
      {depth === 0 && <Separator className="my-4" />}
    </div>
  );
};
