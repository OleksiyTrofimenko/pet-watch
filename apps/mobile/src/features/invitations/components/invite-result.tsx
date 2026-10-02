import {
  Ban,
  CircleAlert,
  CircleCheck,
  Clock,
  Eye,
  HeartOff,
  UserRoundX,
  type LucideIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { IconCircle, type IconCircleTone } from '@/src/design-system';
import type { InviteResultState } from '../invite-state';

/** Copy per state, from AcceptScreen.dc.html. Exhaustive: a new state fails the build here. */
const COPY: Record<
  InviteResultState,
  {
    icon: LucideIcon;
    tone: IconCircleTone;
    title: (pet: string) => string;
    body: (pet: string, me: string) => string;
  }
> = {
  accepted: {
    icon: CircleCheck,
    tone: 'success',
    title: (pet) => `${pet} is now in your pets`,
    body: (pet) => `You'll see ${pet}'s tasks in your schedule from today.`,
  },
  expired: {
    icon: Clock,
    tone: 'warning',
    title: () => 'This invite has expired',
    body: () => 'Ask the owner to send you a new one. Invites last 7 days.',
  },
  already: {
    icon: Eye,
    tone: 'info',
    title: () => "You're already watching this pet",
    body: () => 'You accepted this invite earlier. Nothing else to do.',
  },
  cancelled: {
    icon: Ban,
    tone: 'neutral',
    title: () => 'This invite was cancelled',
    body: () =>
      'The owner cancelled it. If you think that was a mistake, ask them to invite you again.',
  },
  unavailable: {
    icon: HeartOff,
    tone: 'neutral',
    title: () => 'This invite is no longer available',
    body: () =>
      'The pet may have been removed from PetWatch, or the owner sent a newer invite. Check your email for the latest one.',
  },
  'wrong-account': {
    icon: UserRoundX,
    tone: 'warning',
    title: () => 'This invite is for a different account',
    body: (_, me) => `You're signed in as ${me}. Switch to the account the invite was sent to.`,
  },
  error: {
    icon: CircleAlert,
    tone: 'error',
    title: () => "Couldn't open this invite",
    body: () => 'Check your connection and try again.',
  },
};

type InviteResultProps = {
  state: InviteResultState;
  petName: string;
  signedInAs: string;
};

export function InviteResult({ state, petName, signedInAs }: InviteResultProps) {
  const copy = COPY[state];
  return (
    <VStack className="items-center gap-4 pt-8" testID={`invite.${state}`}>
      <IconCircle icon={copy.icon} tone={copy.tone} size="xl" />
      <Text className="text-center font-heading text-[28px] font-semibold leading-[34px] text-typography-900">
        {copy.title(petName)}
      </Text>
      <Text className="text-center text-base text-typography-700">
        {copy.body(petName, signedInAs)}
      </Text>
    </VStack>
  );
}
