
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Comment {
  id: string;
  content: string;
  creator_user_id: string;
  parent_comment_id: string | null;
  content_type: 'event' | 'scholarship' | 'donation' | 'request';
  content_id: string;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  creator_email?: string;
  replies?: Comment[];
}

export const useComments = (contentType: string, contentId: string) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const channelRef = useRef<any>(null);

  const fetchComments = async () => {
    if (!contentId || !contentType) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles!fk_comments_creator_user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: "Error",
          description: "Failed to load comments.",
          variant: "destructive",
        });
        return;
      }

      // Process comments to include creator info and organize replies
      const processedComments = (data || []).map(comment => ({
        ...comment,
        creator_name: comment.user_profiles ? 
          `${comment.user_profiles.first_name} ${comment.user_profiles.last_name}` : 
          'Unknown User',
        creator_email: comment.user_profiles?.email || 'unknown@example.com'
      }));

      // Organize comments into a tree structure (parent comments with replies)
      const commentMap = new Map();
      const rootComments: Comment[] = [];

      // First pass: create map of all comments
      processedComments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into tree structure
      processedComments.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies.push(commentMap.get(comment.id));
          }
        } else {
          rootComments.push(commentMap.get(comment.id));
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (content: string, parentCommentId?: string) => {
    if (!content.trim()) return false;

    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post comments.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setSubmitting(true);
      
      console.log('Creating comment with user ID:', user.id);

      const { error } = await supabase
        .from('comments')
        .insert({
          content: content.trim(),
          content_type: contentType,
          content_id: contentId,
          parent_comment_id: parentCommentId || null,
          creator_user_id: user.id
        });

      if (error) {
        console.error('Error creating comment:', error);
        toast({
          title: "Error",
          description: "Failed to post comment.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Comment posted successfully.",
      });

      await fetchComments(); // Refresh comments
      return true;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!content.trim()) return false;

    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to edit comments.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('creator_user_id', user.id); // Ensure user can only edit their own comments

      if (error) {
        console.error('Error updating comment:', error);
        toast({
          title: "Error",
          description: "Failed to update comment.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Comment updated successfully.",
      });

      await fetchComments(); // Refresh comments
      return true;
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to delete comments.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('creator_user_id', user.id); // Ensure user can only delete their own comments

      if (error) {
        console.error('Error deleting comment:', error);
        toast({
          title: "Error",
          description: "Failed to delete comment.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });

      await fetchComments(); // Refresh comments
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchComments();

    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!contentType || !contentId) return;

    // Set up real-time subscription for comments with unique channel name
    const channelName = `comments-${contentType}-${contentId}-${Date.now()}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `content_type=eq.${contentType},content_id=eq.${contentId}`
        },
        (payload) => {
          console.log('Comments real-time update:', payload);
          fetchComments(); // Refetch comments when any change occurs
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [contentType, contentId]);

  return {
    comments,
    loading,
    submitting,
    createComment,
    updateComment,
    deleteComment,
    fetchComments
  };
};
