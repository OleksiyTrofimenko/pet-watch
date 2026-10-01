import type {
  AuthResponse,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '@petwatch/shared';
import { apiClient } from '@/src/lib/api-client';

export const authApi = {
  register: (input: RegisterInput) => apiClient.post<AuthResponse>('/auth/register', input),
  login: (input: LoginInput) => apiClient.post<AuthResponse>('/auth/login', input),
  forgotPassword: (input: ForgotPasswordInput) =>
    apiClient.post<void>('/auth/forgot-password', input),
  resetPassword: (input: ResetPasswordInput) =>
    apiClient.post<AuthResponse>('/auth/reset-password', input),
  logout: (refreshToken: string) => apiClient.post<void>('/auth/logout', { refreshToken }),
};
