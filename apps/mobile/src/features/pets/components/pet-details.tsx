import type { PetDto } from '@petwatch/shared';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { petSummary } from '../species-visuals';
import { PetPhoto } from './pet-photo';
import { RoleBadge } from './role-badge';

/**
 * Pet header + notes. Watchers get the same layout with edit affordances removed (not greyed),
 * plus one plain-language line saying why (ScreensPets 08-pet-detail).
 */
export function PetDetails({ pet }: { pet: PetDto }) {
  const owner = pet.role === 'OWNER';
  return (
    <VStack className="gap-4">
      <HStack className="items-center gap-4">
        <PetPhoto uri={pet.photoUrl} species={pet.species} name={pet.name} size="large" />
        <VStack className="flex-1 gap-1">
          <Heading className="text-[28px] font-semibold leading-9" testID="pet.title">
            {pet.name}
          </Heading>
          <Text className="text-typography-700">{petSummary(pet)}</Text>
          <HStack className="mt-1 flex-wrap items-center gap-2">
            <RoleBadge role={pet.role} />
            <Text className="text-sm text-typography-700">
              {owner ? `You own ${pet.name}` : `Owned by ${pet.owner.email}`}
            </Text>
          </HStack>
        </VStack>
      </HStack>
      {owner ? null : (
        <Text className="rounded bg-info-50 p-3 text-typography-800">
          You can see {pet.name}&apos;s routine. Only the owner can change it.
        </Text>
      )}
      {pet.notes ? (
        <Text className="text-base leading-6 text-typography-900">{pet.notes}</Text>
      ) : null}
    </VStack>
  );
}
