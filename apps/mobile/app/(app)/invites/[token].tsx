import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSetAtom } from 'jotai';
import { PawPrint } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button, Screen } from '@/src/design-system';
import { rememberPendingInvite } from '@/src/features/auth/pending-link';
import { useLogout } from '@/src/features/auth/queries';
import { useSession } from '@/src/features/auth/session-provider';
import { InviteCard } from '@/src/features/invitations/components/invite-card';
import { InviteResult } from '@/src/features/invitations/components/invite-result';
import { stateForError, type InviteResultState } from '@/src/features/invitations/invite-state';
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

  const state: InviteResultState | 'loading' | 'invite' = accepted
    ? 'accepted'
    : accept.error
      ? stateForError(accept.error)
      : preview.isPending
        ? 'loading'
        : preview.error
          ? stateForError(preview.error)
          : 'invite';
  const petName = preview.data?.petName ?? 'this pet';
  const scheduleLabel = preview.data ? `View ${preview.data.petName}'s schedule` : 'View schedule';
  const petId = accepted?.petId ?? preview.data?.petId;

  const viewSchedule = () => {
    if (petId) setFilter({ petId });
    setViewMode('today');
    router.replace('/');
  };

  return (
    <Screen scroll>
      <HStack className="min-h-[52px] items-center justify-center gap-2">
        <Icon as={PawPrint} className="h-5 w-5 text-primary-600" />
        <Text className="text-[19px] font-semibold text-typography-900">PetWatch</Text>
      </HStack>
      {state === 'loading' ? (
        <VStack className="flex-1 items-center justify-center" accessibilityLabel="Loading invite">
          <Spinner size="large" />
        </VStack>
      ) : state === 'invite' && preview.data ? (
        <InviteCard invite={preview.data} signedInAs={me} />
      ) : state !== 'invite' ? (
        <InviteResult state={state} petName={petName} signedInAs={me} />
      ) : null}
      <VStack className="mt-auto gap-2 pt-6">
        {state === 'invite' ? (
          <>
            <Button
              label="Accept"
              size="lg"
              fullWidth
              isLoading={accept.isPending}
              onPress={() => accept.mutate(undefined, { onSuccess: setAccepted })}
              testID="invite.accept"
            />
            {/* The invite stays pending; the link keeps working until it expires. */}
            <Button
              label="Not now"
              variant="outline"
              action="secondary"
              size="lg"
              fullWidth
              onPress={() => router.replace('/')}
            />
          </>
        ) : null}
        {state === 'accepted' || state === 'already' ? (
          <Button
            label={scheduleLabel}
            size="lg"
            fullWidth
            onPress={viewSchedule}
            testID="invite.view-schedule"
          />
        ) : null}
        {state === 'expired' ||
        state === 'cancelled' ||
        state === 'unavailable' ||
        state === 'error' ? (
          <Button
            label="Go to my pets"
            size="lg"
            fullWidth
            onPress={() => router.replace('/pets')}
          />
        ) : null}
        {state === 'wrong-account' ? (
          <>
            <Button
              label="Switch account"
              size="lg"
              fullWidth
              onPress={() => {
                // Log out, then reopen this invite after the next sign-in.
                rememberPendingInvite(token);
                logout.mutate();
              }}
              testID="invite.switch-account"
            />
            <Button
              label="Not now"
              variant="outline"
              action="secondary"
              size="lg"
              fullWidth
              onPress={() => router.replace('/')}
            />
          </>
        ) : null}
      </VStack>
    </Screen>
  );
}
