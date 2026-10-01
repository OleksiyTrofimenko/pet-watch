import { UserPlus } from 'lucide-react-native';
import type { PendingInvitationDto, PetWatchersDto, WatcherDto } from '@petwatch/shared';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button } from '@/src/design-system';
import { expiresLabel, sinceLabel } from '../format';
import { WatcherRow } from './watcher-row';

type WatchersSectionProps = {
  data: PetWatchersDto;
  now: Date;
  onInvite: () => void;
  onRemove: (watcher: WatcherDto) => void;
  onCancel: (invite: PendingInvitationDto) => void;
};

/** Owner-only: who can see this pet, and who has been asked (ScreensPets 08-pet-detail). */
export function WatchersSection({ data, now, onInvite, onRemove, onCancel }: WatchersSectionProps) {
  const empty = data.watchers.length === 0 && data.pending.length === 0;
  return (
    <VStack className="gap-3" testID="pet.watchers">
      <HStack className="items-baseline justify-between">
        <Text className="text-lg font-bold text-typography-900">Watchers</Text>
        <Text className="text-sm text-typography-700">Only you see this</Text>
      </HStack>
      {empty ? (
        <Text className="rounded-lg border border-dashed border-outline-200 p-4 text-typography-700">
          Nobody else can see this pet yet. Invite someone who already has a PetWatch account.
        </Text>
      ) : null}
      {data.watchers.map((watcher) => (
        <WatcherRow
          key={watcher.userId}
          email={watcher.email}
          detail={sinceLabel(watcher.since)}
          pending={false}
          actionLabel="Remove"
          onAction={() => onRemove(watcher)}
        />
      ))}
      {data.pending.map((invite) => (
        <WatcherRow
          key={invite.invitationId}
          email={invite.email}
          detail={expiresLabel(invite.expiresAt, now)}
          pending
          actionLabel="Cancel"
          onAction={() => onCancel(invite)}
        />
      ))}
      <Button
        label="Invite watcher"
        icon={UserPlus}
        variant="outline"
        fullWidth
        onPress={onInvite}
        testID="pet.invite"
      />
    </VStack>
  );
}
