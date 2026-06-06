import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Avatar } from "../src/components/Avatar";
import { CharacterCounter } from "../src/components/CharacterCounter";
import { useUserProfileQuery } from "../src/hooks/useAuthMutations";
import { useCreatePostMutation } from "../src/hooks/usePostHooks";

export default function CreatePost() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const { data: currentUser } = useUserProfileQuery();
  const { mutate: createPost, isPending } = useCreatePostMutation();
  const colorScheme = useColorScheme();

  const maxLength = 500;
  const isValid = content.trim().length > 0 && content.length <= maxLength;

  const handleSubmit = () => {
    if (!isValid || isPending) return;
    createPost(
      { content: content.trim() },
      {
        onSuccess: () => {
          setContent("");
          router.back();
        },
      }
    );
  };

  const isDark = colorScheme === "dark";

  return (
    <ScreenWrapper className="bg-white dark:bg-[#0A0A0C]" scrollable={false}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121215]">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100 dark:bg-slate-800/40 dark:active:bg-slate-800/80"
          hitSlop={8}
        >
          <Feather name="x" size={18} color={isDark ? "#94A3B8" : "#475569"} />
        </Pressable>
        <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">New Thought</Text>
        <View className="h-10 w-10" />
      </View>

      {/* Editor Body */}
      <View className="flex-1 p-6 flex-row gap-4 bg-white dark:bg-[#0A0A0C]">
        {currentUser && (
          <Avatar name={currentUser.name} size={44} />
        )}
        <View className="flex-1">
          {currentUser && (
            <Text className="font-bold text-slate-800 dark:text-slate-100 mb-1">{currentUser.name}</Text>
          )}
          <TextInput
            multiline
            placeholder="What's on your mind? Share your thoughts..."
            placeholderTextColor={isDark ? "#4B5563" : "#94A3B8"}
            className="flex-1 text-base text-slate-700 dark:text-slate-200 align-top leading-6"
            style={{ textAlignVertical: "top" }}
            value={content}
            onChangeText={setContent}
            autoFocus
            maxLength={600} // Allow typing past 500 so character count red state shows, but cap at 600
          />
        </View>
      </View>

      {/* Bottom Actions Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="border-t border-slate-100 dark:border-slate-800/60 px-6 py-4 flex-row items-center justify-between bg-slate-50 dark:bg-[#121215]"
      >
        <View className="flex-row items-center gap-2">
          <CharacterCounter count={content.length} maxLength={maxLength} />
        </View>

        <Pressable
          disabled={!isValid || isPending}
          onPress={handleSubmit}
          className={`px-5 py-3 rounded-2xl flex-row items-center gap-2 ${
            isValid && !isPending
              ? "bg-indigo-600 active:bg-indigo-700 dark:bg-indigo-500 dark:active:bg-indigo-600"
              : "bg-slate-200 dark:bg-slate-800"
          }`}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Text
                className={`font-bold text-sm ${
                  isValid ? "text-white" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                Post
              </Text>
              <Feather name="send" size={13} color={isValid ? "#ffffff" : (isDark ? "#4B5563" : "#94A3B8")} />
            </View>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
