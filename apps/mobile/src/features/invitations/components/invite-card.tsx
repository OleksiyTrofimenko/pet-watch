import { Clock, Eye, Lock } from 'lucide-react-native';
import type { InvitationPreview } from '@petwatch/shared';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { PetPhoto } from '@/src/features/pets/components/pet-photo';
import { longDate } from '../format';

/**
 * What accepting means, in specifics (AcceptScreen.dc.html): who invited, the pet, what access
 * means, when it expires, and which account is signed in.
 */
export function InviteCard({
  invite,
  signedInAs,
}: {
  invite: InvitationPreview;
  signedInAs: string;
}) {
  const points = [
    {
      icon: Eye,
      tone: 'text-info-700',
      text: `You'll see ${invite.petName}'s care routine and daily schedule.`,
    },
    {
      icon: Lock,
      tone: 'text-typography-700',
      text: 'Only the owner can change it. You can leave any time.',
    },
    {
      icon: Clock,
      tone: 'text-warning-700',
      text: `This invite expires on ${longDate(invite.expiresAt)}.`,
    },
  ];
  return (
    <VStack className="items-center gap-4" testID="invite.card">
      <PetPhoto
        uri={invite.petPhotoUrl}
        species={invite.species}
        name={invite.petName}
        size="large"
      />
      <Text className="text-center font-heading text-[28px] font-semibold leading-[34px] text-typography-900">
        {invite.inviterEmail} invited you to help look after {invite.petName}
      </Text>
      <VStack className="w-full rounded-lg border border-outline-100 bg-background-0 px-4 py-1">
        {points.map((point, index) => (
          <HStack
            key={point.text}
            className={`items-start gap-3 py-3 ${index < points.length - 1 ? 'border-b border-outline-100' : ''}`}
          >
            <Icon as={point.icon} className={`h-5 w-5 ${point.tone}`} />
            <Text className="flex-1 text-[15px] leading-[22px] text-typography-900">
              {point.text}
            </Text>
          </HStack>
        ))}
      </VStack>
      <Text className="text-sm text-typography-700">Signed in as {signedInAs}</Text>
    </VStack>
  );
}
