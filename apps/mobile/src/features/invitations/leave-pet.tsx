import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ConfirmDialog, useNotify } from '@/src/design-system';
import { errorMessage } from '@/src/lib/form-errors';
import { LeavePetSection } from './components/leave-pet-section';
import { useLeavePet } from './queries';

type LeavePetProps = { petId: string; petName: string; ownerEmail: string };

/** The watcher's "Stop watching" block on a pet (INV-7): button, confirmation, then back to Pets. */
export function LeavePet({ petId, petName, ownerEmail }: LeavePetProps) {
  const router = useRouter();
  const notify = useNotify();
  const leave = useLeavePet(petId);
  const [confirming, setConfirming] = useState(false);

  const close = () => {
    leave.reset();
    setConfirming(false);
  };

  const confirm = () =>
    leave.mutate(undefined, {
      onSuccess: () => {
        router.dismissTo('/pets');
        notify(`You no longer watch ${petName}`);
      },
    });

  return (
    <>
      <LeavePetSection
        petName={petName}
        ownerEmail={ownerEmail}
        onLeave={() => setConfirming(true)}
      />
      <ConfirmDialog
        requiresNetwork="stop watching"
        isOpen={confirming}
        title={`Stop watching ${petName}?`}
        body={`${petName} leaves your pets and schedule. ${ownerEmail} isn't notified and can invite you again.`}
        confirmLabel="Stop watching"
        isLoading={leave.isPending}
        error={leave.error ? errorMessage(leave.error) : null}
        onConfirm={confirm}
        onCancel={close}
        testID="leave-confirm"
      />
    </>
  );
}
