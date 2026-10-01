import { HeartOff } from 'lucide-react-native';
import { PET_ERROR_CODES } from '@petwatch/shared';
import { EmptyState } from '@/src/design-system';
import { ApiError } from '@/src/lib/api-client';

/**
 * PET_NOT_FOUND on a pet screen: the pet was deleted or the viewer's access was removed.
 * "Try again" can't fix that, so say what happened and offer the way back.
 */
export function petUnavailable(error: unknown, onBack: () => void) {
  if (!(error instanceof ApiError) || error.code !== PET_ERROR_CODES.PET_NOT_FOUND)
    return undefined;
  return (
    <EmptyState
      icon={HeartOff}
      title="This pet is no longer available"
      description="It was removed, or the owner stopped sharing it with you."
      action={{ label: 'Back to pets', onPress: onBack, testID: 'pet.unavailable-back' }}
    />
  );
}
