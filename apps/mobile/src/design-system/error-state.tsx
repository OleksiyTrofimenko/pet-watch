import { CircleAlert, RotateCcw } from 'lucide-react-native';
import { EmptyState } from './empty-state';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

/** The one error state: same layout as the empty state, error tone, "Try again" (design 07-pets/error). */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      icon={CircleAlert}
      tone="error"
      title="Something went wrong"
      description={message}
      action={onRetry ? { label: 'Try again', icon: RotateCcw, onPress: onRetry } : undefined}
    />
  );
}
