import { Mail } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/src/design-system';
import { AuthFooter } from './auth-footer';
import { AuthLayout } from './auth-layout';

type CheckEmailProps = {
  email: string;
  isResending: boolean;
  onResend: () => void;
  onBackToLogin: () => void;
};

/** Same screen whether or not the account exists (no enumeration), so no success tick. */
export function CheckEmail({ email, isResending, onResend, onBackToLogin }: CheckEmailProps) {
  return (
    <AuthLayout
      title="Check your email"
      lead="If an account exists for this email, we've sent a reset link."
      badge={{ icon: Mail, tone: 'primary' }}
      showBrand={false}
      testID="forgot.sent"
    >
      <Text className="-mt-4 text-base font-semibold text-typography-900">{email}</Text>
      <Button label="Back to log in" size="lg" fullWidth onPress={onBackToLogin} />
      <AuthFooter
        prompt="No email after a few minutes?"
        actionLabel={isResending ? 'Sending…' : 'Send again'}
        onPress={onResend}
        testID="forgot.resend"
      />
    </AuthLayout>
  );
}
