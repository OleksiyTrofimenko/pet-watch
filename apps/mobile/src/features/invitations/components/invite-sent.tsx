import { CircleCheck, Send } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button, IconCircle } from '@/src/design-system';

type InviteSentProps = {
  inviteeEmail: string;
  /** A pending invite existed: the email went out again with a new link. */
  resent: boolean;
  onDone: () => void;
  onInviteAnother: () => void;
};

/** Replaces the invite form once an email went out: sent vs re-sent (N-4). */
export function InviteSent({ inviteeEmail, resent, onDone, onInviteAnother }: InviteSentProps) {
  return (
    <VStack className="gap-3 pt-1" testID="invite.result">
      <IconCircle icon={resent ? Send : CircleCheck} tone="success" size="md" />
      <Text className="text-2xl font-semibold text-typography-900">
        {resent ? 'Invite re-sent' : 'Invite sent'}
      </Text>
      <Text className="text-base text-typography-700">
        {resent
          ? `Invite re-sent to ${inviteeEmail}. The earlier link no longer works.`
          : `Invite sent to ${inviteeEmail}. They'll appear as a watcher once they accept.`}
      </Text>
      <Button label="Done" size="lg" fullWidth onPress={onDone} testID="invite.done" />
      <Button label="Invite someone else" variant="link" fullWidth onPress={onInviteAnother} />
    </VStack>
  );
}
