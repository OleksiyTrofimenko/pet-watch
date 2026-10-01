import { useMutation } from '@tanstack/react-query';
import { authApi } from './api';
import { useSession } from './session-provider';

// Auth has no server state to cache: these are mutations, and success updates the session.
// onSuccess is awaited by mutateAsync, so a form's submit resolves once the user is signed in.

export function useRegister() {
  const { signIn } = useSession();
  return useMutation({ mutationFn: authApi.register, onSuccess: signIn });
}

export function useLogin() {
  const { signIn } = useSession();
  return useMutation({ mutationFn: authApi.login, onSuccess: signIn });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: authApi.forgotPassword });
}

export function useResetPassword() {
  const { signIn } = useSession();
  return useMutation({ mutationFn: authApi.resetPassword, onSuccess: signIn });
}

export function useLogout() {
  const { signOut } = useSession();
  // Local sign-out must work offline; TanStack would otherwise pause the mutation until online.
  return useMutation({ mutationFn: signOut, networkMode: 'always' });
}
