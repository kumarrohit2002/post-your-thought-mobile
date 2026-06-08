import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../src/context/AuthContext";
import { AppProviders } from "../src/providers/AppProviders";
import "../global.css";
import * as Notifications from "expo-notifications";
import { NotificationHandler } from "../src/components/NotificationHandler";

// Configure presentation behavior for notifications received when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
import { View, ActivityIndicator, Text, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const splashOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Animate logo in
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 800 });

    // 2. Pulse logo
    const pulseTimer = setTimeout(() => {
      logoScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    }, 800);

    // 3. Fade text in
    textOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));

    // 4. Fade entire splash screen out before finishing
    const fadeTimer = setTimeout(() => {
      splashOpacity.value = withTiming(0, { duration: 500 });
    }, 2000);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, containerStyle]} className="absolute inset-0 z-50">
      <LinearGradient
        colors={["#1E1B4B", "#0A0A0C", "#020617"]}
        className="flex-1 items-center justify-center"
      >
        <Animated.View style={logoStyle} className="items-center justify-center mb-6">
          <View className="h-24 w-24 items-center justify-center rounded-3xl bg-indigo-500/10 border border-indigo-500/30 shadow-2xl shadow-indigo-500/40">
            <Feather name="edit-3" size={48} color="#818CF8" />
          </View>
        </Animated.View>

        <Animated.View style={textStyle} className="items-center">
          <Text className="text-3xl font-extrabold tracking-tight text-white">
            Post<Text className="text-indigo-400">Your</Text>Thought
          </Text>
          <Text className="text-slate-400 text-xs font-semibold tracking-widest mt-2.5 uppercase">
            Share your mind instantly
          </Text>
        </Animated.View>

        <View className="absolute bottom-12 items-center">
          <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Premium Experience
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if user is currently on login or signup screen
    const inAuthGroup = segments[0] === "login" || segments[0] === "signup";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home dashboard if authenticated and trying to access auth screens
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, segments]);

  const colorScheme = useColorScheme();
  const loadingBgColor = colorScheme === "dark" ? "#0A0A0C" : "#F8FAFC";
  const spinnerColor = colorScheme === "dark" ? "#818CF8" : "#0E4D92";

  if (isLoading) {
    return (
      <View style={{ backgroundColor: loadingBgColor }} className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={spinnerColor} />
      </View>
    );
  }

  return (
    <>
      {isAuthenticated && <NotificationHandler />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="index" />
        <Stack.Screen name="profile" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="create-post" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="post/[id]" options={{ animation: "slide_from_right" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const colorScheme = useColorScheme();

  // Dynamically set system root background color to prevent flash of white screen/bars
  useEffect(() => {
    const rootBgColor = colorScheme === "dark" ? "#0A0A0C" : "#F8FAFC";
    SystemUI.setBackgroundColorAsync(rootBgColor).catch((err) => {
      console.warn("Failed to set SystemUI background color:", err);
    });
  }, [colorScheme]);

  // If splash is showing, use dark-themed light status bar, otherwise match system scheme
  const statusBarStyle = showSplash ? "light" : (colorScheme === "dark" ? "light" : "dark");

  return (
    <AppProviders>
      <StatusBar style={statusBarStyle} />
      <View className="flex-1">
        <AuthGuard />
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </View>
    </AppProviders>
  );
}
