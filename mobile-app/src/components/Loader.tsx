import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

export const Loader: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  // Render a list of 3 skeleton cards
  return (
    <View className="flex-1 p-1">
      {[1, 2, 3].map((key) => (
        <Animated.View
          key={key}
          style={{ opacity: fadeAnim }}
          className="mb-4 rounded-3xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121215] p-5"
        >
          {/* Header Row */}
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
            <View className="gap-1.5">
              <View className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <View className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
            </View>
          </View>
          {/* Content Rows */}
          <View className="mt-4 gap-2">
            <View className="h-3.5 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <View className="h-3.5 w-[90%] rounded bg-slate-200 dark:bg-slate-800" />
            <View className="h-3.5 w-[60%] rounded bg-slate-200 dark:bg-slate-800" />
          </View>
          {/* Footer Row */}
          <View className="mt-5 flex-row items-center gap-6 border-t border-slate-50 dark:border-slate-800/40 pt-4">
            <View className="h-6 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />
            <View className="h-6 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />
          </View>
        </Animated.View>
      ))}
    </View>
  );
};
