import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, useColorScheme } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ScreenWrapper } from "../../src/components/ScreenWrapper";
import { PostCard } from "../../src/components/PostCard";
import { CommentCard } from "../../src/components/CommentCard";
import { EmptyState } from "../../src/components/EmptyState";
import { Avatar } from "../../src/components/Avatar";
import { usePostQuery, useCommentMutation } from "../../src/hooks/usePostHooks";
import { useUserProfileQuery } from "../../src/hooks/useAuthMutations";

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const colorScheme = useColorScheme();

  const { data: currentUser } = useUserProfileQuery();
  const { data: post, isLoading: isPostLoading, isError, error, refetch } = usePostQuery(id || "");
  const { mutate: addComment, isPending: isCommentPending } = useCommentMutation(id || "");

  const maxLength = 200;
  const isValidComment = commentText.trim().length > 0 && commentText.length <= maxLength;
  const isDark = colorScheme === "dark";

  const handleSubmitComment = () => {
    if (!isValidComment || isCommentPending) return;
    addComment(commentText.trim(), {
      onSuccess: () => {
        setCommentText("");
      },
    });
  };

  return (
    <ScreenWrapper className="bg-slate-50 dark:bg-[#0A0A0C]" scrollable={false}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121215]">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100 dark:bg-slate-800/40 dark:active:bg-slate-800/80 mr-3"
          hitSlop={8}
        >
          <Feather name="arrow-left" size={18} color={isDark ? "#94A3B8" : "#475569"} />
        </Pressable>
        <Text className="text-xl font-bold text-slate-800 dark:text-slate-100">Discussion</Text>
      </View>

      {isPostLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? "#818CF8" : "#4F46E5"} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center p-6">
          <EmptyState
            title="Unable to load post"
            message={error?.message || "Please check your network and try again."}
            iconName="wifi-off"
            actionTitle="Retry"
            onAction={refetch}
          />
        </View>
      ) : post ? (
        <View className="flex-1">
          <FlatList
            data={post.comments || []}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
            ListHeaderComponent={
              <PostCard post={post} showCommentsLink={false} />
            }
            ListHeaderComponentStyle={{ marginBottom: 20 }}
            ListEmptyComponent={
              <EmptyState
                title="No comments yet"
                message="Be the first to share your thoughts on this post!"
                iconName="message-circle"
              />
            }
            renderItem={({ item }) => (
              <CommentCard comment={item} postId={post._id} />
            )}
          />

          {/* Bottom Write Comment Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            className="border-t border-slate-100 dark:border-slate-800/60 px-4 py-3.5 bg-white dark:bg-[#121215] flex-row items-center gap-2.5"
          >
            {currentUser && (
              <Avatar name={currentUser.name} size={34} />
            )}
            <View className="flex-1 flex-row items-center border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-[#1C1C21]/60 rounded-2xl px-4 py-2">
              <TextInput
                placeholder="Write a comment..."
                placeholderTextColor={isDark ? "#4B5563" : "#94A3B8"}
                className="flex-1 text-[14px] text-slate-700 dark:text-slate-100 max-h-20 py-1"
                multiline
                value={commentText}
                onChangeText={setCommentText}
                maxLength={220} // Allow slightly past 200, display remaining dynamically
              />
              <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold ml-2">
                {maxLength - commentText.length}
              </Text>
            </View>

            <Pressable
              disabled={!isValidComment || isCommentPending}
              onPress={handleSubmitComment}
              className={`h-11 w-11 items-center justify-center rounded-2xl ${
                isValidComment && !isCommentPending
                  ? "bg-indigo-600 active:bg-indigo-700 dark:bg-indigo-500 dark:active:bg-indigo-600"
                  : "bg-slate-100 dark:bg-slate-800/40"
              }`}
            >
              {isCommentPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Feather
                  name="send"
                  size={15}
                  color={isValidComment ? "#ffffff" : (isDark ? "#4B5563" : "#94A3B8")}
                />
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      ) : null}
    </ScreenWrapper>
  );
}
