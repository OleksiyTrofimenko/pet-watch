import { Clock } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { Button } from '@/src/design-system';
import { AuthLayout } from './auth-layout';

type LinkExpiredProps = {
  onRequestNewLink: () => void;
  onBackToLogin: () => void;
};

export function LinkExpired({ onRequestNewLink, onBackToLogin }: LinkExpiredProps) {
  return (
    <AuthLayout
      title="This link has expired or was already used"
      lead="Reset links only work once. Ask for a new one and use the newest email."
      badge={{ icon: Clock, tone: 'error' }}
      testID="reset.expired"
    >
      <Button label="Request a new link" size="lg" fullWidth onPress={onRequestNewLink} />
      <HStack className="justify-center">
        <Button variant="link" size="sm" label="Back to log in" onPress={onBackToLogin} />
      </HStack>
    </AuthLayout>
  );
}
