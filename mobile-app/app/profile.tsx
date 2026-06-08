import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View, FlatList, useColorScheme, Switch } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { NotificationService } from "../src/services/notificationService";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Button } from "../src/components/Button";
import { Avatar } from "../src/components/Avatar";
import { PostCard } from "../src/components/PostCard";
import { EmptyState } from "../src/components/EmptyState";
import { useAuth } from "../src/context/AuthContext";
import { useUserProfileQuery } from "../src/hooks/useAuthMutations";
import { usePostsQuery } from "../src/hooks/usePostHooks";

type TabType = "thoughts" | "details";

export default function Profile() {
  const router = useRouter();
  const { logout } = useAuth();
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<TabType>("thoughts");

  const { data: user, isLoading: isUserLoading, isError, error, refetch } = useUserProfileQuery();

  const [newPostsEnabled, setNewPostsEnabled] = useState(true);

  React.useEffect(() => {
    if (user) {
      const enabled = (user as any).notificationSettings?.newPosts !== false;
      setNewPostsEnabled(enabled);
    }
  }, [user]);

  const handleToggleNotifications = async (value: boolean) => {
    setNewPostsEnabled(value);
    try {
      await NotificationService.updateNotificationSettings(value);
    } catch (err) {
      console.error("Failed to update notification settings:", err);
      // Revert if API call fails
      setNewPostsEnabled(!value);
    }
  };

  // Fetch posts to filter user's own thoughts
  const { data: postsData, isLoading: isPostsLoading } = usePostsQuery(1, 100);

  const myPosts = postsData?.data?.filter((p) => p.userId === user?.uid) || [];
  const isDark = colorScheme === "dark";

  const renderHeader = () => {
    if (!user) return null;

    return (
      <View className="items-center pb-6 mt-4">
        <View className="relative">
          <Avatar name={user.name} size={84} />
          <View className="absolute bottom-0 right-0 bg-green-500 h-4 w-4 rounded-full border-2 border-white dark:border-[#0A0A0C]" />
        </View>
        <Text className="mt-4 text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
          {user.name}
        </Text>
        <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">
          Active Account
        </Text>
      </View>
    );
  };

  return (
    <ScreenWrapper className="bg-slate-50 dark:bg-[#0A0A0C]" scrollable={false}>
      {/* Header bar */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121215]">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-xl bg-slate-50 active:bg-slate-100 dark:bg-slate-800/40 dark:active:bg-slate-800/80 mr-1"
            hitSlop={8}
          >
            <Feather name="arrow-left" size={18} color={isDark ? "#94A3B8" : "#475569"} />
          </Pressable>
          <Text className="text-xl font-bold text-slate-800 dark:text-slate-100">My Profile</Text>
        </View>
        <Pressable
          onPress={() => logout()}
          className="h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/20 active:bg-rose-100 dark:active:bg-rose-950/45"
          hitSlop={8}
        >
          <Feather name="log-out" size={16} color="#EF4444" />
        </Pressable>
      </View>

      {isUserLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? "#818CF8" : "#4F46E5"} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center p-6">
          <EmptyState
            title="Fetch Failed"
            message={error?.message || "Could not retrieve profile info."}
            iconName="wifi-off"
            actionTitle="Retry"
            onAction={refetch}
          />
        </View>
      ) : user ? (
        <View className="flex-1">
          {/* Profile Header Block */}
          {renderHeader()}

          {/* Premium Tab Selector Bar */}
          <View className="flex-row border-b border-slate-100 dark:border-slate-800/50 mx-6 mb-4">
            <Pressable
              onPress={() => setActiveTab("thoughts")}
              className="flex-1 py-3 items-center justify-center relative"
            >
              <Text
                className={`text-sm font-bold tracking-wide ${
                  activeTab === "thoughts"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                Thoughts ({myPosts.length})
              </Text>
              {activeTab === "thoughts" && (
                <View className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </Pressable>

            <Pressable
              onPress={() => setActiveTab("details")}
              className="flex-1 py-3 items-center justify-center relative"
            >
              <Text
                className={`text-sm font-bold tracking-wide ${
                  activeTab === "details"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                Details
              </Text>
              {activeTab === "details" && (
                <View className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </Pressable>
          </View>

          {/* Tab Content Panels */}
          {activeTab === "thoughts" ? (
            <FlatList
              data={myPosts}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 60 }}
              renderItem={({ item }) => <PostCard post={item} />}
              ListEmptyComponent={
                isPostsLoading ? (
                  <ActivityIndicator size="small" color={isDark ? "#818CF8" : "#4F46E5"} className="py-8" />
                ) : (
                  <EmptyState
                    title="No Thoughts Yet"
                    message="You haven't posted any thoughts. Share something with the community!"
                    iconName="edit"
                    actionTitle="Create Post"
                    onAction={() => router.push("/create-post" as any)}
                  />
                )
              }
            />
          ) : (
            <View className="px-6 flex-1">
              <View
                className="bg-white dark:bg-[#121215] border border-slate-100 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm shadow-slate-100/50"
              >
                <View className="gap-5">
                  <View className="flex-row items-center gap-4">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/40">
                      <Feather name="mail" size={16} color={isDark ? "#818CF8" : "#4F46E5"} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Email Address
                      </Text>
                      <Text className="text-[15px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">{user.email}</Text>
                    </View>
                  </View>

                  {user.phoneNumber ? (
                    <View className="flex-row items-center gap-4">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/40">
                        <Feather name="phone" size={16} color={isDark ? "#818CF8" : "#4F46E5"} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          Phone Number
                        </Text>
                        <Text className="text-[15px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">{user.phoneNumber}</Text>
                      </View>
                    </View>
                  ) : null}

                  <View className="flex-row items-center gap-4">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/40">
                      <Feather name="bell" size={16} color={isDark ? "#818CF8" : "#4F46E5"} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        New Post Notifications
                      </Text>
                      <Text className="text-[15px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {newPostsEnabled ? "Enabled" : "Disabled"}
                      </Text>
                    </View>
                    <Switch
                      value={newPostsEnabled}
                      onValueChange={handleToggleNotifications}
                      trackColor={{ false: isDark ? "#334155" : "#E2E8F0", true: "#818CF8" }}
                      thumbColor={newPostsEnabled ? "#4F46E5" : "#F4F4F5"}
                    />
                  </View>

                  <View className="flex-row items-center gap-4">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/40">
                      <Feather name="key" size={16} color={isDark ? "#818CF8" : "#4F46E5"} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        User UID
                      </Text>
                      <Text
                        className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5"
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {user.uid}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/60">
                  <Button
                    title="Logout Account"
                    variant="danger"
                    onPress={() => logout()}
                  />
                </View>
              </View>
            </View>
          )}
        </View>
      ) : null}
    </ScreenWrapper>
  );
}
