import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Button } from "../src/components/Button";
import { useAuth } from "../src/context/AuthContext";
import { useUserProfileQuery } from "../src/hooks/useAuthMutations";
import { Feather } from "@expo/vector-icons";

export default function Home() {
  const { logout } = useAuth();
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useUserProfileQuery();

  return (
    <ScreenWrapper className="bg-slate-50" scrollable={true}>
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="mb-8 flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-semibold uppercase tracking-wider text-[#F59E0B]">
              Welcome Dashboard
            </Text>
            <Text className="mt-1 text-2xl font-bold text-slate-900">
              User Profile
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => logout()}
              className="h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 active:bg-red-100"
            >
              <Feather name="log-out" size={20} color="#EF4444" />
            </Pressable>
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#0E4D92]">
              <Text className="text-lg font-bold text-white">RN</Text>
            </View>
          </View>
        </View>

        {/* Profile Card Container */}
        <View className="flex-1 justify-center">
          {isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#0E4D92" />
              <Text className="mt-4 text-sm font-medium text-slate-500">
                Fetching profile data...
              </Text>
            </View>
          ) : isError ? (
            <View
              className="items-center rounded-3xl border border-red-100 bg-white p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <Feather name="wifi-off" size={24} color="#EF4444" />
              </View>
              <Text className="text-center text-lg font-bold text-slate-900">
                Sync Failed
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-slate-500">
                {error?.message ||
                  "Could not retrieve profile information. Ensure your backend server is running."}
              </Text>
              <Button
                title="Retry Sync"
                variant="secondary"
                className="mt-6"
                onPress={() => refetch()}
              />
            </View>
          ) : user ? (
            <View
              className="rounded-3xl border border-slate-100 bg-white p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {/* Profile Avatar & Intro */}
              <View className="mb-6 items-center border-b border-slate-100 pb-6">
                <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-[#E0F2FE]">
                  <Text className="text-2xl font-bold text-[#0E4D92]">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </Text>
                </View>
                <Text className="text-xl font-bold text-slate-900">
                  {user.name || "N/A"}
                </Text>
                <Text className="mt-1 text-sm text-slate-500">
                  Active Account
                </Text>
              </View>

              {/* Profile Details List */}
              <View className="mb-2 gap-4">
                <View className="flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                    <Feather name="mail" size={18} color="#64748B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-medium text-slate-400">
                      EMAIL ADDRESS
                    </Text>
                    <Text className="mt-0.5 text-base font-semibold text-slate-800">
                      {user.email || "N/A"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                    <Feather name="phone" size={18} color="#64748B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-medium text-slate-400">
                      PHONE NUMBER
                    </Text>
                    <Text className="mt-0.5 text-base font-semibold text-slate-800">
                      {user.phoneNumber || "N/A"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                    <Feather name="key" size={18} color="#64748B" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-medium text-slate-400">
                      FIREBASE UID
                    </Text>
                    <Text
                      className="mt-0.5 text-sm font-medium text-slate-600"
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {user.uid}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        {/* Logout Actions */}
        <View className="mt-auto pt-6">
          <Button title="Log Out" variant="danger" onPress={() => logout()} />
          <Text className="mt-4 text-center text-xs text-slate-400">
            Auth template connected successfully to Express & Firebase.
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}
