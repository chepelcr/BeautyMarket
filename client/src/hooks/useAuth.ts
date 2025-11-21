import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  resendSignUpCode,
} from 'aws-amplify/auth';
import { buildUserApiUrl } from '@/lib/apiUtils';

// Initialize Amplify
import '../lib/amplify';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  gender?: string;
  genderOther?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface VerifyEmailData {
  email: string;
  code: string;
}

interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function authenticatedRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    if (idToken) {
      headers.Authorization = `Bearer ${idToken}`;
    }
  } catch (error) {
    console.warn('No auth session available');
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle token expiration
  if (response.status === 401 || response.status === 403) {
    try {
      // Try to refresh the token
      const session = await fetchAuthSession({ forceRefresh: true });
      const newToken = session.tokens?.idToken?.toString();

      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        return fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
    }
  }

  return response;
}

export function useAuth() {
  const queryClient = useQueryClient();

  // User profile query
  const {
    data: user,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async (): Promise<UserProfile | null> => {
      try {
        const amplifyUser = await getCurrentUser();
        const response = await authenticatedRequest(
          'GET',
          buildUserApiUrl(amplifyUser.userId, '/profile')
        );

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error('Failed to fetch user profile');
        }

        return response.json();
      } catch (error) {
        console.warn('No authenticated user');
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const userAttributes: any = {
        email: data.email,
        given_name: data.firstName,
        family_name: data.lastName,
        preferred_username: data.username,
      };

      // Add gender if provided
      if (data.gender) {
        const genderValue = data.gender === 'other' && data.genderOther
          ? data.genderOther
          : data.gender;
        userAttributes['custom:gender'] = genderValue;
      }

      const result = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes,
        },
      });

      return {
        needsVerification: !result.isSignUpComplete,
        userId: result.userId,
      };
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      // Clear any existing session
      try {
        await signOut();
      } catch {
        // Ignore if no session exists
      }

      const result = await signIn({
        username: data.email,
        password: data.password,
      });

      // Check if verification is needed
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        return {
          needsVerification: true,
          email: data.email,
        };
      }

      // Get user profile
      const amplifyUser = await getCurrentUser();
      const response = await authenticatedRequest(
        'GET',
        buildUserApiUrl(amplifyUser.userId, '/profile')
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userProfile = await response.json();
      queryClient.setQueryData(['user-profile'], userProfile);

      return {
        needsVerification: false,
        user: userProfile,
      };
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: VerifyEmailData) => {
      await confirmSignUp({
        username: data.email,
        confirmationCode: data.code,
      });

      return { verified: true };
    },
  });

  // Complete verification (sync to backend)
  const completeVerificationMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      gender?: string;
      genderOther?: string;
    }) => {
      const body: any = {
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      // Add gender if provided
      if (data.gender) {
        body.gender = data.gender === 'other' && data.genderOther
          ? data.genderOther
          : data.gender;
      }

      const response = await authenticatedRequest(
        'POST',
        buildUserApiUrl(data.userId, '/profile/verify-email-complete'),
        body
      );

      if (!response.ok) {
        throw new Error('Failed to complete verification');
      }

      return response.json();
    },
  });

  // Resend verification code
  const resendCodeMutation = useMutation({
    mutationFn: async (email: string) => {
      await resendSignUpCode({ username: email });
      return { sent: true };
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      await resetPassword({ username: email });
      return { sent: true };
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      await confirmResetPassword({
        username: data.email,
        confirmationCode: data.code,
        newPassword: data.newPassword,
      });
      return { reset: true };
    },
  });

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      queryClient.setQueryData(['user-profile'], null);
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Force logout (clear everything)
  const forceLogout = async () => {
    try {
      await signOut({ global: true });
    } catch {
      // Ignore errors
    }
    queryClient.setQueryData(['user-profile'], null);
    queryClient.clear();
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoadingUser,
    refetchUser,

    // Mutations
    register: registerMutation,
    login: loginMutation,
    verifyEmail: verifyEmailMutation,
    completeVerification: completeVerificationMutation,
    resendCode: resendCodeMutation,
    forgotPassword: forgotPasswordMutation,
    resetPassword: resetPasswordMutation,

    // Actions
    logout,
    forceLogout,

    // Utility
    authenticatedRequest,
  };
}
