import api from "./api";
import {
  PostFeedResponse,
  SinglePostResponse,
  LikeResponse,
  CommentResponse,
  CreatePostPayload,
  Post,
  Comment,
} from "../types/post";

export class PostService {
  // 1. Get all posts with pagination
  static async getPosts(page: number = 1, limit: number = 10): Promise<PostFeedResponse> {
    const response = await api.get<PostFeedResponse>("/posts", {
      params: { page, limit },
    });
    return response.data;
  }

  // 2. Get single post by ID
  static async getPostById(id: string): Promise<Post> {
    const response = await api.get<SinglePostResponse>(`/posts/${id}`);
    return response.data.data;
  }

  // 3. Create a new post
  static async createPost(payload: CreatePostPayload): Promise<Post> {
    const response = await api.post<SinglePostResponse>("/posts", payload);
    return response.data.data;
  }

  // 4. Toggle Like on a post
  static async toggleLike(id: string): Promise<LikeResponse["data"]> {
    const response = await api.patch<LikeResponse>(`/posts/${id}/like`);
    return response.data.data;
  }

  // 5. Add a comment to a post
  static async addComment(postId: string, text: string): Promise<Comment> {
    const response = await api.post<CommentResponse>(`/posts/${postId}/comment`, { text });
    return response.data.data;
  }

  // 6. Delete a post
  static async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  }

  // 7. Delete a comment from a post
  static async deleteComment(postId: string, commentId: string): Promise<void> {
    await api.delete(`/posts/${postId}/comment/${commentId}`);
  }
}
