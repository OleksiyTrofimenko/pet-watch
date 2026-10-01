import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, Info, Send } from 'lucide-react-native';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView } from 'react-native';
import { useForm } from 'react-hook-form';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  INVITATION_ERROR_CODES,
  createInvitationSchema,
  type CreateInvitationInput,
  type CreateInvitationResult,
} from '@petwatch/shared';
import { Button, FormAlert, FormInput } from '@/src/design-system';
import { useApiSubmit } from '@/src/lib/form-errors';

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
  const close = () => {
    setResult(null);
    form.reset();
    onClose();
  };
  const sent = result && result.outcome !== 'ALREADY_WATCHING' ? result : null;

  const sheet = (
    <>
      <ActionsheetBackdrop />
      <ActionsheetContent className="items-stretch px-5 pb-8">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        {sent ? (
          <VStack className="gap-3 pt-1" testID="invite.result">
            <Box className="h-14 w-14 items-center justify-center rounded-full bg-success-100">
              <Icon
                as={sent.outcome === 'INVITE_SENT' ? CircleCheck : Send}
                className="h-6 w-6 text-success-700"
              />
            </Box>
            <Text className="text-2xl font-semibold text-typography-900">
              {sent.outcome === 'INVITE_SENT' ? 'Invite sent' : 'Invite re-sent'}
            </Text>
            <Text className="text-base text-typography-700">
              {sent.outcome === 'INVITE_SENT'
                ? `Invite sent to ${sent.inviteeEmail}. They'll appear as a watcher once they accept.`
                : `Invite re-sent to ${sent.inviteeEmail}. The earlier link no longer works.`}
            </Text>
            <Button label="Done" size="lg" fullWidth onPress={close} testID="invite.done" />
            <Button
              label="Invite someone else"
              variant="link"
              fullWidth
              onPress={() => {
                setResult(null);
                form.reset();
              }}
            />
          </VStack>
        ) : (
          <VStack className="gap-4 pt-1">
            <VStack className="gap-1.5">
              <Text className="text-2xl font-semibold text-typography-900">
                Invite a watcher for {petName}
              </Text>
              <Text className="text-[15px] text-typography-700">
                They&apos;ll see {petName}&apos;s routine and schedule. They can&apos;t change
                anything.
              </Text>
            </VStack>
            {formError ? <FormAlert message={formError} /> : null}
            <FormInput
              control={form.control}
              name="email"
              label="Their email"
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoFocus
              testID="invite.email"
            />
            {result?.outcome === 'ALREADY_WATCHING' ? (
              <HStack
                className="items-start gap-2.5 rounded bg-info-50 px-3.5 py-3"
                accessibilityRole="alert"
                testID="invite.already"
              >
                <Icon as={Info} className="mt-0.5 h-[18px] w-[18px] text-info-700" />
                <Text className="flex-1 text-[15px] font-semibold text-info-700">
                  {result.inviteeEmail} is already watching {petName}.
                </Text>
              </HStack>
            ) : null}
            <Button
              label={form.formState.isSubmitting ? 'Sending…' : 'Send invite'}
              icon={Send}
              size="lg"
              fullWidth
              isLoading={form.formState.isSubmitting}
              onPress={() => void submit()}
              requiresNetwork="send invites"
              testID="invite.send"
            />
            <Button label="Cancel" variant="link" action="secondary" fullWidth onPress={close} />
          </VStack>
        )}
      </ActionsheetContent>
    </>
  );

  return (
    <Actionsheet isOpen={isOpen} onClose={close}>
      {/* The autofocused field opens the keyboard over the sheet (iOS overlays it; Android's
          edge-to-edge window doesn't resize for a modal): lift the sheet, Gluestack's documented way. */}
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, justifyContent: 'flex-end', position: 'relative' }}
      >
        {sheet}
      </KeyboardAvoidingView>
    </Actionsheet>
  );
}
