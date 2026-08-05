/**
 * Shared visibility rules for "Private" posts.
 *
 * A post marked `is_private` is hidden from everyone except:
 *  - the user who created it (the poster)
 *  - administrators
 */
export interface PrivatablePost {
  creator_user_id?: string | null;
  is_private?: boolean | null;
}

export const canViewPost = (
  post: PrivatablePost,
  userId?: string | null,
  isAdministrator?: boolean,
): boolean => {
  if (!post?.is_private) return true;
  if (isAdministrator) return true;
  return !!userId && post.creator_user_id === userId;
};

export const filterVisiblePosts = <T extends PrivatablePost>(
  posts: T[] | undefined | null,
  userId?: string | null,
  isAdministrator?: boolean,
): T[] => (posts || []).filter((post) => canViewPost(post, userId, isAdministrator));
