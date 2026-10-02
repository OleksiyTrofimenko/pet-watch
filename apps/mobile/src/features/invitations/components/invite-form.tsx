import { Send } from 'lucide-react-native';
import type { Control } from 'react-hook-form';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { CreateInvitationInput } from '@petwatch/shared';
import { Button, FormAlert, FormInput } from '@/src/design-system';
import { AlreadyWatchingNotice } from './already-watching-notice';

type InviteFormProps = {
  petName: string;
  control: Control<CreateInvitationInput>;
  formError: string | null;
  isSubmitting: boolean;
  /** Set when the last invite went to someone who already watches the pet. */
  alreadyWatching: string | null;
  onSubmit: () => void;
  onCancel: () => void;
};

/** The email step of the invite sheet (ScreensSharing 11). */
export function InviteForm({
  petName,
  control,
  formError,
  isSubmitting,
  alreadyWatching,
  onSubmit,
  onCancel,
}: InviteFormProps) {
  return (
    <VStack className="gap-4 pt-1">
      <VStack className="gap-1.5">
        <Text className="text-2xl font-semibold text-typography-900">
          Invite a watcher for {petName}
        </Text>
        <Text className="text-[15px] text-typography-700">
          They&apos;ll see {petName}&apos;s routine and schedule. They can&apos;t change anything.
        </Text>
      </VStack>
      {formError ? <FormAlert message={formError} /> : null}
      <FormInput
        control={control}
        name="email"
        label="Their email"
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoFocus
        testID="invite.email"
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      {alreadyWatching ? <AlreadyWatchingNotice email={alreadyWatching} petName={petName} /> : null}
      <Button
        label={isSubmitting ? 'Sending…' : 'Send invite'}
        icon={Send}
        size="lg"
        fullWidth
        isLoading={isSubmitting}
        onPress={onSubmit}
        requiresNetwork="send invites"
        testID="invite.send"
      />
      <Button label="Cancel" variant="link" action="secondary" fullWidth onPress={onCancel} />
    </VStack>
  );
}
