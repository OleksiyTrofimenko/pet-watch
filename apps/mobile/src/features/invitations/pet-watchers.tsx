import { useState } from 'react';
import type { PendingInvitationDto, WatcherDto } from '@petwatch/shared';
import { ConfirmDialog, QueryView, useNotify } from '@/src/design-system';
import { useNow } from '@/src/features/schedule/use-now';
import { InviteSheet } from './components/invite-sheet';
import { WatchersSection } from './components/watchers-section';
import { useCancelInvitation, useInvite, useRevokeWatcher, useWatchers } from './queries';

type Confirming =
  { kind: 'remove'; watcher: WatcherDto } | { kind: 'cancel'; invite: PendingInvitationDto } | null;

/** The owner's Watchers block on a pet: list, invite sheet, remove/cancel with confirmation. */
export function PetWatchers({ petId, petName }: { petId: string; petName: string }) {
  const notify = useNotify();
  const now = useNow();
  const watchers = useWatchers(petId, true);
  const invite = useInvite(petId);
  const revoke = useRevokeWatcher(petId);
  const cancel = useCancelInvitation(petId);
  const [inviting, setInviting] = useState(false);
  const [confirming, setConfirming] = useState<Confirming>(null);

  const confirm = () => {
    if (confirming?.kind === 'remove') {
      const { email, userId } = confirming.watcher;
      revoke.mutate(userId, {
        onSuccess: () => {
          setConfirming(null);
          notify(`${email} can no longer see ${petName}`);
        },
      });
    } else if (confirming?.kind === 'cancel') {
      cancel.mutate(confirming.invite.invitationId, { onSuccess: () => setConfirming(null) });
    }
  };

  return (
    <>
      <QueryView query={watchers} loading={null}>
        {(data) => (
          <WatchersSection
            data={data}
            now={now}
            onInvite={() => setInviting(true)}
            onRemove={(watcher) => setConfirming({ kind: 'remove', watcher })}
            onCancel={(pending) => setConfirming({ kind: 'cancel', invite: pending })}
          />
        )}
      </QueryView>
      <InviteSheet
        isOpen={inviting}
        petName={petName}
        onInvite={invite.mutateAsync}
        onClose={() => setInviting(false)}
      />
      <ConfirmDialog
        isOpen={confirming !== null}
        title={
          confirming?.kind === 'remove'
            ? `Remove ${confirming.watcher.email}'s access to ${petName}?`
            : `Cancel the invite to ${confirming?.invite.email ?? ''}?`
        }
        body={
          confirming?.kind === 'remove'
            ? `They won't see ${petName}'s routine or schedule anymore. You can invite them again later.`
            : 'The link in their email will stop working. You can invite them again later.'
        }
        confirmLabel={confirming?.kind === 'remove' ? 'Remove' : 'Cancel invite'}
        isLoading={revoke.isPending || cancel.isPending}
        onConfirm={confirm}
        onCancel={() => setConfirming(null)}
        testID="watcher-confirm"
      />
    </>
  );
}
