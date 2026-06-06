export interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  image?: string;
  likesCount: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PostFeedResponse {
  success: boolean;
  data: Post[];
  pagination: PaginationMeta;
}

export interface SinglePostResponse {
  success: boolean;
  data: Post;
}

export interface LikeResponse {
  success: boolean;
  data: {
    liked: boolean;
    likesCount: number;
  };
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: Comment;
}

export interface CreatePostPayload {
  content: string;
  image?: string;
}

export interface AddCommentPayload {
  text: string;
}
