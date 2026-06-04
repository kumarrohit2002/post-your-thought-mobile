import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { UserProfile } from "../types/auth";

export const useLoginMutation = () => {
  const { saveToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.login,
    onSuccess: async (data) => {
      await saveToken(data.idToken);
      // Invalidate existing queries to trigger a fresh user profile fetch
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: AuthService.signUp,
  });
};

export const useGoogleLoginMutation = () => {
  const { saveToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.googleLogin,
    onSuccess: async (data) => {
      await saveToken(data.idToken);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};

export const useUserProfileQuery = () => {
  const { token } = useAuth();

  return useQuery<UserProfile, Error>({
    queryKey: ["userProfile", token],
    queryFn: AuthService.getProfile,
    enabled: !!token, // Only fetch profile if a valid token exists
    staleTime: 1000 * 60 * 5, // Cache the profile for 5 minutes
    retry: 1, // Retry once before failing
  });
};
