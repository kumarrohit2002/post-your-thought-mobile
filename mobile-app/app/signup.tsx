import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { Input } from "../src/components/Input";
import { Button } from "../src/components/Button";
import { useSignupMutation } from "../src/hooks/useAuthMutations";
import { Feather } from "@expo/vector-icons";

export default function Signup() {
  const router = useRouter();
  const signupMutation = useSignupMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = "Name is required";

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9]{10,14}$/.test(phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Invalid phone format (E.164 expected, e.g., +919876543210)";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
    if (!validate()) return;

    signupMutation.mutate(
      { name, email, password, phoneNumber: phone },
      {
        onSuccess: () => {
          // Redirect to login page upon success
          router.replace({
            pathname: "/login",
            params: { message: "Account created successfully! Please log in." },
          });
        },
        onError: (err: any) => {
          const apiError =
            err.response?.data?.message ||
            err.message ||
            "Something went wrong during sign up.";
          setErrors({ api: apiError });
        },
      }
    );
  };

  return (
    <ScreenWrapper className="bg-slate-50 dark:bg-[#0A0A0C]">
      {/* Decorative Glow Elements */}
      <View className="absolute top-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[80px]" />
      <View className="absolute bottom-[-100px] left-[-100px] w-[350px] h-[350px] rounded-full bg-purple-500/10 dark:bg-purple-600/5 blur-[80px]" />

      <View className="flex-1 justify-center px-6 py-12">
        {/* Header Section */}
        <View className="mb-8 items-center">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 mb-4 shadow-sm shadow-indigo-500/20">
            <Feather name="user-plus" size={26} color="#6366F1" />
          </View>
          <Text className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Create Account
          </Text>
          <Text className="mt-2 text-[15px] text-slate-500 dark:text-slate-400 text-center px-4">
            Join the conversation, document your thoughts.
          </Text>
        </View>

        {/* Premium Carbon Card Wrapper */}
        <View className="bg-white dark:bg-[#121215] border border-slate-100 dark:border-slate-800/60 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none mb-6">
          {errors.api && (
            <View className="mb-5 flex-row items-center rounded-2xl border border-red-100 dark:border-red-950/20 bg-red-50 dark:bg-red-950/10 p-4">
              <Feather name="alert-circle" size={18} color="#EF4444" />
              <Text className="ml-3 flex-1 text-sm font-semibold text-red-600 dark:text-red-400">
                {errors.api}
              </Text>
            </View>
          )}

          <View className="gap-1">
            <Input
              label="Full Name"
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              error={errors.name}
              icon={<Feather name="user" size={18} color="#6366F1" />}
            />

            <Input
              label="Email Address"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
              keyboardType="email-address"
              icon={<Feather name="mail" size={18} color="#6366F1" />}
            />

            <Input
              label="Phone Number"
              value={phone}
              onChangeText={(val) => {
                setPhone(val);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              error={errors.phone}
              keyboardType="phone-pad"
              icon={<Feather name="phone" size={18} color="#6366F1" />}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={errors.password}
              secureTextEntry
              icon={<Feather name="lock" size={18} color="#6366F1" />}
            />
          </View>

          <Button
            title="Sign Up"
            className="mt-4"
            isLoading={signupMutation.isPending}
            onPress={handleSignup}
          />
        </View>

        {/* Login Redirect */}
        <View className="flex-row justify-center gap-1.5 mt-2">
          <Text className="text-[14.5px] text-slate-500 dark:text-slate-400">
            Already have an account?
          </Text>
          <Link href="/login" asChild>
            <Pressable>
              <Text className="text-[14.5px] font-extrabold text-indigo-600 dark:text-indigo-400">
                Log In
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScreenWrapper>
  );
}
