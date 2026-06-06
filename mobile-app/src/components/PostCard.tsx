import React from "react";
import { View, Text, Pressable, Alert, Share, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Feather, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Avatar } from "./Avatar";
import { Post } from "../types/post";
import { useUserProfileQuery } from "../hooks/useAuthMutations";
import { useLikePostMutation, useDeletePostMutation } from "../hooks/usePostHooks";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";

interface PostCardProps {
  post: Post;
  showCommentsLink?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, showCommentsLink = true }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data: currentUser } = useUserProfileQuery();
  const { mutate: toggleLike, isPending: isLikePending } = useLikePostMutation();
  const { mutate: deletePost } = useDeletePostMutation();

  const isOwner = currentUser?.uid === post.userId;
  const isLiked = currentUser ? post.likedBy.includes(currentUser.uid) : false;

  const mockHandle = `@${(post.userName || "user").toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  // Reanimated Heart Pop Values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const triggerLikeAnimation = () => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 200 }),
      withDelay(10, withSpring(0, { damping: 12, stiffness: 150 }))
    );
    opacity.value = withSequence(
      withSpring(1, { damping: 12 }),
      withDelay(10, withSpring(0))
    );
  };

  // Nice dates formatter
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;

      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const handleCardPress = () => {
    if (showCommentsLink) {
      router.push(`/post/${post._id}` as any);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this thought by ${post.userName}: "${post.content}"`,
      });
    } catch (error) {
      console.error("Error sharing thought:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Thought",
      "Are you sure you want to permanently delete this thought?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePost(post._id);
            if (!showCommentsLink) {
              router.back();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleOptionsPress = () => {
    const actions = [
      { text: "Share Thought", onPress: () => { handleShare(); } },
    ];

    if (isOwner) {
      actions.push({ text: "Delete Thought", onPress: () => { handleDelete(); } });
    }

    Alert.alert(
      "Thought Options",
      undefined,
      [
        ...actions.map((act) => ({
          text: act.text,
          onPress: act.onPress,
          style: act.text.includes("Delete") ? ("destructive" as const) : ("default" as const),
        })),
        { text: "Cancel", style: "cancel" as const },
      ],
      { cancelable: true }
    );
  };

  // Define Gestures
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      runOnJS(triggerLikeAnimation)();
      if (!isLiked && !isLikePending) {
        runOnJS(toggleLike)(post._id);
      }
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => {
      if (showCommentsLink) {
        runOnJS(handleCardPress)();
      }
    });

  const cardGesture = Gesture.Exclusive(doubleTap, singleTap);

  return (
    <View
      className="mb-5 rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#131316] p-5 relative overflow-hidden"
      style={{
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Floating Heart Pop Overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: -35,
            marginLeft: -35,
            zIndex: 50,
            justifyContent: "center",
            alignItems: "center",
          },
          animatedHeartStyle,
        ]}
      >
        <AntDesign name="heart" size={70} color="#F43F5E" />
      </Animated.View>

      {/* Main Container */}
      <View className="flex-col">
        {/* Header Section: Avatar + User Info + Options */}
        <View className="flex-row items-center justify-between mb-3.5">
          <View className="flex-row items-center gap-3 flex-1">
            <Avatar name={post.userName} uri={post.userAvatar} size={46} />
            
            <GestureDetector gesture={cardGesture}>
              <View className="flex-col flex-1">
                {/* Name & Badge Row */}
                <View className="flex-row items-center gap-1.5 flex-wrap">
                  <Text className="text-[16px] font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                    {post.userName}
                  </Text>
                  <MaterialIcons name="verified" size={15} color="#1D9BF0" style={{ marginTop: 1 }} />
                </View>

                {/* Handle & Time */}
                <View className="flex-row items-center gap-1.5 mt-0.5">
                  <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                    {mockHandle}
                  </Text>
                  <Text className="text-slate-300 dark:text-slate-700 text-[10px]">
                    •
                  </Text>
                  <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                    {formatTimeAgo(post.createdAt)}
                  </Text>
                </View>
              </View>
            </GestureDetector>
          </View>

          {/* More options button */}
          <Pressable
            onPress={handleOptionsPress}
            className="h-9 w-9 items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100 dark:bg-slate-800/40 dark:active:bg-slate-800/80 border border-slate-100/50 dark:border-slate-800/60"
            hitSlop={8}
          >
            <Feather name="more-horizontal" size={17} color={isDark ? "#94A3B8" : "#64748B"} />
          </Pressable>
        </View>

        {/* Content Section */}
        <GestureDetector gesture={cardGesture}>
          <View className="mb-4 pl-1">
            <Text className="text-slate-800 dark:text-slate-200 text-[15px] leading-[23px] font-normal tracking-wide">
              {post.content}
            </Text>
          </View>
        </GestureDetector>

        {/* Footer Actions Row */}
        <View className="flex-row items-center justify-between border-t border-slate-100/80 dark:border-slate-800/40 pt-3.5 mt-1">
          <View className="flex-row items-center gap-3">
            {/* Like Action Pill */}
            <Pressable
              onPress={() => {
                runOnJS(triggerLikeAnimation)();
                toggleLike(post._id);
              }}
              disabled={isLikePending}
              className={`flex-row items-center gap-2 px-4 py-2 rounded-2xl border ${
                isLiked
                  ? "bg-rose-50/60 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40"
                  : "bg-slate-50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800/60"
              }`}
              hitSlop={8}
            >
              {isLiked ? (
                <AntDesign name="heart" size={14} color="#F43F5E" />
              ) : (
                <Feather name="heart" size={14} color={isDark ? "#94A3B8" : "#64748B"} />
              )}
              <Text
                className={`text-xs font-bold ${
                  isLiked ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {post.likesCount || 0}
              </Text>
            </Pressable>

            {/* Comment Action Pill */}
            <Pressable
              onPress={handleCardPress}
              className={`flex-row items-center gap-2 px-4 py-2 rounded-2xl border ${
                post.comments?.length > 0
                  ? "bg-indigo-50/40 border-indigo-100 dark:bg-indigo-950/15 dark:border-indigo-900/30"
                  : "bg-slate-50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800/60"
              }`}
              hitSlop={8}
            >
              <Feather 
                name="message-circle" 
                size={14} 
                color={post.comments?.length > 0 ? (isDark ? "#818CF8" : "#4F46E5") : (isDark ? "#94A3B8" : "#64748B")} 
              />
              <Text 
                className={`text-xs font-bold ${
                  post.comments?.length > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {post.comments?.length || 0}
              </Text>
            </Pressable>
          </View>

          {/* Share Action Pill */}
          <Pressable
            onPress={handleShare}
            className="h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800/30 dark:border-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800/60"
            hitSlop={8}
          >
            <Feather name="share-2" size={14} color={isDark ? "#94A3B8" : "#64748B"} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};
