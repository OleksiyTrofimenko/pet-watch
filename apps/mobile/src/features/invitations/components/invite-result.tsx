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
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { InviteResultState } from '../invite-state';

type Tone = 'success' | 'warning' | 'info' | 'neutral' | 'error';

const TONE: Record<Tone, { circle: string; icon: string }> = {
  success: { circle: 'bg-success-100', icon: 'text-success-700' },
  warning: { circle: 'bg-warning-100', icon: 'text-warning-700' },
  info: { circle: 'bg-info-100', icon: 'text-info-700' },
  neutral: { circle: 'bg-secondary-100', icon: 'text-secondary-700' },
  error: { circle: 'bg-error-100', icon: 'text-error-700' },
};

/** Copy per state, from AcceptScreen.dc.html. Exhaustive: a new state fails the build here. */
const COPY: Record<
  InviteResultState,
  {
    icon: LucideIcon;
    tone: Tone;
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
  const tone = TONE[copy.tone];
  return (
    <VStack className="items-center gap-4 pt-8" testID={`invite.${state}`}>
      <Box className={`h-20 w-20 items-center justify-center rounded-full ${tone.circle}`}>
        <Icon as={copy.icon} className={`h-9 w-9 ${tone.icon}`} />
      </Box>
      <Text className="text-center font-heading text-[28px] font-semibold leading-[34px] text-typography-900">
        {copy.title(petName)}
      </Text>
      <Text className="text-center text-base text-typography-700">
        {copy.body(petName, signedInAs)}
      </Text>
    </VStack>
  );
}
