import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { User } from "../models/userModel";
import { Post } from "../models/postModel";

export class PostController {
  // 1. Create Post
  static async createPost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { content, image } = req.body;
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      if (!content || typeof content !== "string" || content.trim() === "") {
        res.status(400).json({
          success: false,
          message: "Post content is required and cannot be empty.",
        });
        return;
      }

      if (content.length > 500) {
        res.status(400).json({
          success: false,
          message: "Post content cannot exceed 500 characters.",
        });
        return;
      }

      // Fetch user profile from MongoDB to get the display name
      const user = await User.findOne({ uid });
      if (!user) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }

      const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name
      )}&background=0E4D92&color=fff&bold=true`;

      const newPost = new Post({
        userId: user.uid,
        userName: user.name,
        userAvatar,
        content: content.trim(),
        image: image || "",
        likesCount: 0,
        likedBy: [],
        comments: [],
      });

      const savedPost = await newPost.save();

      res.status(201).json({
        success: true,
        message: "Post created successfully.",
        data: savedPost,
      });
    } catch (error: any) {
      console.error("Error creating post:", error);
      next(error);
    }
  }

  // 2. Get All Posts (Paginated)
  static async getPosts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const totalPosts = await Post.countDocuments();
      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPages = Math.ceil(totalPosts / limit);

      res.status(200).json({
        success: true,
        data: posts,
        pagination: {
          page,
          limit,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      next(error);
    }
  }

  // 3. Get Single Post
  static async getPost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const post = await Post.findById(id);
      if (!post) {
        res.status(404).json({ success: false, message: "Post not found." });
        return;
      }

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      console.error("Error fetching single post:", error);
      // Handle invalid MongoDB ObjectId format gracefully
      if (error.name === "CastError") {
        res.status(400).json({ success: false, message: "Invalid post ID format." });
        return;
      }
      next(error);
    }
  }

  // 4. Delete Post
  static async deletePost(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const post = await Post.findById(id);
      if (!post) {
        res.status(404).json({ success: false, message: "Post not found." });
        return;
      }

      // Ensure that only the owner can delete the post
      if (post.userId !== uid) {
        res.status(403).json({
          success: false,
          message: "Access denied. You can only delete your own posts.",
        });
        return;
      }

      await post.deleteOne();

      res.status(200).json({
        success: true,
        message: "Post deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting post:", error);
      next(error);
    }
  }

  // 5. Toggle Like
  static async toggleLike(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const post = await Post.findById(id);
      if (!post) {
        res.status(404).json({ success: false, message: "Post not found." });
        return;
      }

      const likedIndex = post.likedBy.indexOf(uid);
      let liked = false;

      if (likedIndex > -1) {
        // Unlike post
        post.likedBy.splice(likedIndex, 1);
        liked = false;
      } else {
        // Like post
        post.likedBy.push(uid);
        liked = true;
      }

      post.likesCount = post.likedBy.length;
      await post.save();

      res.status(200).json({
        success: true,
        data: {
          liked,
          likesCount: post.likesCount,
        },
      });
    } catch (error: any) {
      console.error("Error toggling like:", error);
      next(error);
    }
  }

  // 6. Add Comment
  static async addComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      if (!text || typeof text !== "string" || text.trim() === "") {
        res.status(400).json({
          success: false,
          message: "Comment text is required and cannot be empty.",
        });
        return;
      }

      if (text.length > 200) {
        res.status(400).json({
          success: false,
          message: "Comment text cannot exceed 200 characters.",
        });
        return;
      }

      const post = await Post.findById(id);
      if (!post) {
        res.status(404).json({ success: false, message: "Post not found." });
        return;
      }

      const user = await User.findOne({ uid });
      if (!user) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }

      const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name
      )}&background=0E4D92&color=fff&bold=true`;

      const newComment = {
        userId: user.uid,
        userName: user.name,
        userAvatar,
        text: text.trim(),
        createdAt: new Date(),
      };

      // Mongoose handles generation of subdocument _id automatically
      post.comments.push(newComment as any);
      await post.save();

      // Return the newly added comment (which is the last element in comments array)
      const addedComment = post.comments[post.comments.length - 1];

      res.status(201).json({
        success: true,
        message: "Comment added successfully.",
        data: addedComment,
      });
    } catch (error: any) {
      console.error("Error adding comment:", error);
      next(error);
    }
  }

  // 7. Delete Comment
  static async deleteComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postId, commentId } = req.params;
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const post = await Post.findById(postId);
      if (!post) {
        res.status(404).json({ success: false, message: "Post not found." });
        return;
      }

      // Find comment subdocument
      const commentIndex = post.comments.findIndex(
        (c) => c._id.toString() === commentId
      );

      if (commentIndex === -1) {
        res.status(404).json({ success: false, message: "Comment not found." });
        return;
      }

      const comment = post.comments[commentIndex];

      // Verify that only the comment owner can delete the comment
      if (comment.userId !== uid) {
        res.status(403).json({
          success: false,
          message: "Access denied. You can only delete your own comments.",
        });
        return;
      }

      // Remove the comment from array
      post.comments.splice(commentIndex, 1);
      await post.save();

      res.status(200).json({
        success: true,
        message: "Comment deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      next(error);
    }
  }
}
