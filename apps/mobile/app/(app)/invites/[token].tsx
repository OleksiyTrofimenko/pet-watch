import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import { PawPrint } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Screen } from '@/src/design-system';
import { rememberPendingInvite } from '@/src/features/auth/pending-link';
import { useLogout } from '@/src/features/auth/queries';
import { useSession } from '@/src/features/auth/session-provider';
import { InviteActions } from '@/src/features/invitations/components/invite-actions';
import { InviteCard } from '@/src/features/invitations/components/invite-card';
import { InviteResult } from '@/src/features/invitations/components/invite-result';
import { InviteSkeleton } from '@/src/features/invitations/components/invite-skeleton';
import { screenState } from '@/src/features/invitations/invite-state';
import { useAcceptInvitation, useInvitationPreview } from '@/src/features/invitations/queries';
import { petFilterAtom, viewModeAtom } from '@/src/features/schedule/atoms';

/**
 * Deep link target: petwatch://invites/<token> (signed in; a signed-out link is replayed after
 * login, see pending-link). A focused step: no tab bar.
 */
export default function AcceptInviteScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { session } = useSession();
  const preview = useInvitationPreview(token);
  const accept = useAcceptInvitation(token);
  const logout = useLogout();
  const setFilter = useSetAtom(petFilterAtom);
  const setViewMode = useSetAtom(viewModeAtom);
  const [accepted, setAccepted] = useState<{ petId: string } | null>(null);
  const me = session.status === 'signed-in' ? session.user.email : '';

  const state = screenState({
    accepted: accepted !== null,
    acceptError: accept.error,
    preview,
  });
  const petName = preview.data?.petName ?? 'this pet';
  const petId = accepted?.petId ?? preview.data?.petId;

  const viewSchedule = () => {
    if (petId) setFilter({ petId });
    setViewMode('today');
    router.replace('/');
  };
  const switchAccount = () => {
    // Log out, then reopen this invite after the next sign-in.
    rememberPendingInvite(token);
    logout.mutate();
  };

  return (
    <Screen scroll>
      <HStack className="min-h-[52px] items-center justify-center gap-2">
        <Icon as={PawPrint} className="h-5 w-5 text-primary-600" />
        <Text className="text-[19px] font-semibold text-typography-900">PetWatch</Text>
      </HStack>
      {state === 'loading' ? (
        <InviteSkeleton />
      ) : state === 'invite' ? (
        preview.data ? (
          <InviteCard invite={preview.data} signedInAs={me} />
        ) : null
      ) : (
        <InviteResult state={state} petName={petName} signedInAs={me} />
      )}
      <InviteActions
        state={state}
        scheduleLabel={preview.data ? `View ${preview.data.petName}'s schedule` : 'View schedule'}
        isAccepting={accept.isPending}
        onAccept={() => accept.mutate(undefined, { onSuccess: setAccepted })}
        onNotNow={() => router.replace('/')}
        onViewSchedule={viewSchedule}
        onGoToPets={() => router.replace('/pets')}
        onSwitchAccount={switchAccount}
      />
    </Screen>
  );
}
