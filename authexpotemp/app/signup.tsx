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
    <ScreenWrapper className="bg-slate-50">
      <View className="flex-1 justify-center px-6 py-12">
        <View className="mb-10">
          <Text className="text-3xl font-bold text-slate-900">Create Account</Text>
          <Text className="mt-2 text-base text-slate-500">
            Sign up to get started with our premium starter kit.
          </Text>
        </View>

        {errors.api && (
          <View className="mb-6 flex-row items-center rounded-2xl border border-red-100 bg-red-50 p-4">
            <Feather name="alert-circle" size={20} color="#EF4444" />
            <Text className="ml-3 flex-1 text-sm font-medium text-red-600">
              {errors.api}
            </Text>
          </View>
        )}

        <View className="gap-2">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={(val) => {
              setName(val);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={errors.name}
            icon={<Feather name="user" size={20} color="#64748B" />}
          />

          <Input
            label="Email Address"
            placeholder="john.doe@example.com"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={errors.email}
            keyboardType="email-address"
            icon={<Feather name="mail" size={20} color="#64748B" />}
          />

          <Input
            label="Phone Number"
            placeholder="+919876543210"
            value={phone}
            onChangeText={(val) => {
              setPhone(val);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
            }}
            error={errors.phone}
            keyboardType="phone-pad"
            icon={<Feather name="phone" size={20} color="#64748B" />}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={errors.password}
            secureTextEntry
            icon={<Feather name="lock" size={20} color="#64748B" />}
          />
        </View>

        <Button
          title="Sign Up"
          className="mt-6"
          isLoading={signupMutation.isPending}
          onPress={handleSignup}
        />

        <View className="mt-8 flex-row justify-center gap-1.5">
          <Text className="text-sm text-slate-500">Already have an account?</Text>
          <Link href="/login" asChild>
            <Pressable>
              <Text className="text-sm font-bold text-[#0E4D92]">Log In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScreenWrapper>
  );
}
