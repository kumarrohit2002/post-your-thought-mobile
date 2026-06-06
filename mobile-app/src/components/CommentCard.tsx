import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { Avatar } from "./Avatar";
import { Comment } from "../types/post";
import { useUserProfileQuery } from "../hooks/useAuthMutations";
import { useDeleteCommentMutation } from "../hooks/usePostHooks";

interface CommentCardProps {
  comment: Comment;
  postId: string;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment, postId }) => {
  const { data: currentUser } = useUserProfileQuery();
  const { mutate: deleteComment } = useDeleteCommentMutation(postId);

  const isOwner = currentUser?.uid === comment.userId;

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "";
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteComment(comment._id),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="mb-3 flex-row gap-3 border-b border-slate-50 dark:border-slate-800/40 pb-3">
      <Avatar name={comment.userName} uri={comment.userAvatar} size={36} />
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {comment.userName}
              </Text>
              <MaterialIcons name="verified" size={12} color="#1D9BF0" style={{ marginTop: 1 }} />
            </View>
            <Text className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              • {formatTimeAgo(comment.createdAt)}
            </Text>
          </View>
          {isOwner && (
            <Pressable
              onPress={handleDelete}
              className="h-7 w-7 items-center justify-center rounded-lg active:bg-slate-100 dark:active:bg-slate-800"
              hitSlop={8}
            >
              <Feather name="trash-2" size={14} color="#EF4444" />
            </Pressable>
          )}
        </View>
        <Text className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-5">
          {comment.text}
        </Text>
      </View>
    </View>
  );
};
