import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Keyboard } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useForm } from 'react-hook-form';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import {
  INVITATION_ERROR_CODES,
  createInvitationSchema,
  type CreateInvitationInput,
  type CreateInvitationResult,
} from '@petwatch/shared';
import { useApiSubmit } from '@/src/lib/form-errors';
import { InviteForm } from './invite-form';
import { InviteSent } from './invite-sent';

type InviteSheetProps = {
  isOpen: boolean;
  petName: string;
  onInvite: (input: CreateInvitationInput) => Promise<CreateInvitationResult>;
  onClose: () => void;
};

/**
 * Invite a watcher (ScreensSharing 11). Sent/re-sent replace the form; "already watching" is info,
 * not an error; problems (no account, self) stay on the field so the email can be fixed in place.
 */
export function InviteSheet({ isOpen, petName, onInvite, onClose }: InviteSheetProps) {
  const [result, setResult] = useState<CreateInvitationResult | null>(null);
  const form = useForm<CreateInvitationInput>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { email: '' },
  });
  const { submit, formError } = useApiSubmit(
    form,
    ['email'],
    async (values) => {
      const next = await onInvite(values);
      setResult(next);
      // Sent/re-sent replace the form with the result view: don't leave the keyboard over it.
      if (next.outcome !== 'ALREADY_WATCHING') Keyboard.dismiss();
    },
    {
      [INVITATION_ERROR_CODES.USER_NOT_FOUND]: 'email',
      [INVITATION_ERROR_CODES.CANNOT_INVITE_SELF]: 'email',
    },
  );
  const reset = () => {
    setResult(null);
    form.reset();
  };
  const close = () => {
    reset();
    onClose();
  };
  const sent = result && result.outcome !== 'ALREADY_WATCHING' ? result : null;

  return (
    <Actionsheet isOpen={isOpen} onClose={close}>
      {/* The autofocused field opens the keyboard over the sheet (iOS overlays it; Android's
          edge-to-edge window doesn't resize for a modal): lift the sheet with keyboard-controller. */}
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, justifyContent: 'flex-end', position: 'relative' }}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent className="items-stretch px-5 pb-8">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {sent ? (
            <InviteSent
              inviteeEmail={sent.inviteeEmail}
              resent={sent.outcome === 'INVITE_RESENT'}
              onDone={close}
              onInviteAnother={reset}
            />
          ) : (
            <InviteForm
              petName={petName}
              control={form.control}
              formError={formError}
              isSubmitting={form.formState.isSubmitting}
              alreadyWatching={result?.outcome === 'ALREADY_WATCHING' ? result.inviteeEmail : null}
              onSubmit={() => void submit()}
              onCancel={close}
            />
          )}
        </ActionsheetContent>
      </KeyboardAvoidingView>
    </Actionsheet>
  );
}
