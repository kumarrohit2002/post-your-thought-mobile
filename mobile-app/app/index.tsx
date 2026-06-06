import React, { useState, useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View, FlatList, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Avatar } from "../src/components/Avatar";
import { PostCard } from "../src/components/PostCard";
import { Loader } from "../src/components/Loader";
import { EmptyState } from "../src/components/EmptyState";
import { useUserProfileQuery } from "../src/hooks/useAuthMutations";
import { usePostsQuery } from "../src/hooks/usePostHooks";
import { Post } from "../src/types/post";

export default function Home() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colorScheme = useColorScheme();

  const { data: user } = useUserProfileQuery();
  const { data: postsData, isLoading, isFetching, refetch } = usePostsQuery(page, 10);

  // Sync loaded posts and support appending for pagination
  useEffect(() => {
    if (postsData?.data) {
      if (page === 1) {
        setAllPosts(postsData.data);
      } else {
        setAllPosts((prev) => {
          // Avoid duplicate keys in list
          const existingIds = new Set(prev.map((p) => p._id));
          const newPosts = postsData.data.filter((p) => !existingIds.has(p._id));
          return [...prev, ...newPosts];
        });
      }
    }
  }, [postsData, page]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    await refetch();
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    if (postsData?.pagination?.hasNextPage && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  const hasNextPage = postsData?.pagination?.hasNextPage;
  const isDark = colorScheme === "dark";

  return (
    <ScreenWrapper className="bg-slate-50 dark:bg-[#0A0A0C]" scrollable={false}>
      {/* Premium Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121215]">
        <View>
          <Text className="text-[10px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
            Community Space
          </Text>
          <Text className="text-2xl font-black text-slate-800 dark:text-slate-50 tracking-tight">
            Post<Text className="text-indigo-500 dark:text-indigo-400">Your</Text>Thought
          </Text>
        </View>

        {user && (
          <Pressable
            onPress={() => router.push("/profile" as any)}
            className="flex-row items-center gap-2 border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-[#1C1C21]/60 p-1.5 rounded-full pr-3.5 active:bg-slate-50 dark:active:bg-slate-800/80"
          >
            <Avatar name={user.name} size={30} />
            <Text className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[80px]" numberOfLines={1}>
              {user.name.split(" ")[0]}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Main Feed Content */}
      <View className="flex-1">
        {isLoading && page === 1 ? (
          <View className="p-4">
            <Loader />
          </View>
        ) : allPosts.length === 0 ? (
          <View className="flex-1 items-center justify-center p-6">
            <EmptyState
              title="Nothing to see here"
              message="The community feed is currently quiet. Be the first to start the conversation!"
              iconName="message-square"
              actionTitle="Write First Thought"
              onAction={() => router.push("/create-post" as any)}
            />
          </View>
        ) : (
          <FlatList
            data={allPosts}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
            renderItem={({ item }) => <PostCard post={item} />}
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
            ListFooterComponent={
              hasNextPage ? (
                <Pressable
                  onPress={handleLoadMore}
                  disabled={isFetching}
                  className="my-4 py-3.5 rounded-2xl border border-indigo-600 dark:border-indigo-500/60 items-center justify-center active:bg-indigo-500/10"
                >
                  {isFetching ? (
                    <ActivityIndicator size="small" color={isDark ? "#818CF8" : "#4F46E5"} />
                  ) : (
                    <Text className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                      Load More Thoughts
                    </Text>
                  )}
                </Pressable>
              ) : (
                <Text className="text-center text-xs text-slate-400 dark:text-slate-500 font-semibold my-8">
                  {"You've caught up with all thoughts! 🎉"}
                </Text>
              )
            }
          />
        )}
      </View>

      {/* Write Floating Action Button */}
      <Pressable
        onPress={() => router.push("/create-post" as any)}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-indigo-600 active:bg-indigo-700 dark:bg-indigo-500 dark:active:bg-indigo-600"
        style={{
          shadowColor: "#6366F1",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Feather name="plus" size={26} color="#ffffff" />
      </Pressable>
    </ScreenWrapper>
  );
}
