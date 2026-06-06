export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phoneNumber: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    idToken: string;
    refreshToken: string;
    expiresIn: string;
    uid: string;
  };
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
}
