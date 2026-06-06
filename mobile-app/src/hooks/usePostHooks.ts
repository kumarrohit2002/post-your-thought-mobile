import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PostService } from "../services/postService";
import { useUserProfileQuery } from "./useAuthMutations";
import { Post, PostFeedResponse } from "../types/post";

// 1. Fetch Paginated Posts Hook
export const usePostsQuery = (page: number = 1, limit: number = 10) => {
  return useQuery<PostFeedResponse, Error>({
    queryKey: ["posts", page, limit],
    queryFn: () => PostService.getPosts(page, limit),
    staleTime: 1000 * 30, // 30 seconds stale time
  });
};

// 2. Fetch Single Post Hook
export const usePostQuery = (id: string) => {
  return useQuery<Post, Error>({
    queryKey: ["post", id],
    queryFn: () => PostService.getPostById(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  });
};

// 3. Create Post Mutation Hook
export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PostService.createPost,
    onSuccess: () => {
      // Invalidate the posts feed queries to refresh after creation
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// 4. Toggle Like Mutation Hook with Optimistic Updates
export const useLikePostMutation = () => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useUserProfileQuery();

  return useMutation({
    mutationFn: PostService.toggleLike,
    onMutate: async (postId) => {
      const userUid = currentUser?.uid;
      if (!userUid) return;

      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      // Snapshot the previous states
      const previousPostsPages = queryClient.getQueryData(["posts"]);
      const previousPost = queryClient.getQueryData<Post>(["post", postId]);

      // 1. Optimistically update single post detail if it exists in cache
      if (previousPost) {
        const isLiked = previousPost.likedBy.includes(userUid);
        const updatedLikedBy = isLiked
          ? previousPost.likedBy.filter((uid) => uid !== userUid)
          : [...previousPost.likedBy, userUid];

        queryClient.setQueryData<Post>(["post", postId], {
          ...previousPost,
          likedBy: updatedLikedBy,
          likesCount: updatedLikedBy.length,
        });
      }

      // 2. Optimistically update the post in the paginated feeds list
      queryClient.setQueriesData<PostFeedResponse>({ queryKey: ["posts"] }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((post) => {
            if (post._id === postId) {
              const isLiked = post.likedBy.includes(userUid);
              const updatedLikedBy = isLiked
                ? post.likedBy.filter((uid) => uid !== userUid)
                : [...post.likedBy, userUid];

              return {
                ...post,
                likedBy: updatedLikedBy,
                likesCount: updatedLikedBy.length,
              };
            }
            return post;
          }),
        };
      });

      // Return context containing previous state for rollbacks
      return { previousPostsPages, previousPost, postId };
    },
    onError: (err, postId, context: any) => {
      // Rollback to previous snapshot if error occurs
      if (context) {
        queryClient.setQueryData(["posts"], context.previousPostsPages);
        queryClient.setQueryData(["post", context.postId], context.previousPost);
      }
    },
    onSettled: (data, error, postId) => {
      // Invalidate queries to ensure UI is in sync with backend server state
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
};

// 5. Add Comment Mutation Hook
export const useCommentMutation = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => PostService.addComment(postId, text),
    onSuccess: () => {
      // Invalidate single post and feed to update comments list and comments count
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
};

// 6. Delete Post Mutation Hook
export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PostService.deletePost,
    onSuccess: () => {
      // Invalidate feed to remove the post
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// 7. Delete Comment Mutation Hook
export const useDeleteCommentMutation = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => PostService.deleteComment(postId, commentId),
    onSuccess: () => {
      // Invalidate single post and feed to remove comment and decrement comment count
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
};
