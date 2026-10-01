import { ChevronRight, Users } from 'lucide-react-native';
import type { PetDto } from '@petwatch/shared';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { petSummary } from '../species-visuals';
import { PetPhoto } from './pet-photo';
import { RoleBadge } from './role-badge';

type PetCardProps = {
  pet: PetDto;
  onPress: () => void;
};

/** The whole card is one Pressable → pet detail (PetCard.dc.html). */
export function PetCard({ pet, onPress }: PetCardProps) {
  const summary = petSummary(pet);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${pet.name}, ${summary}`}
      testID={`pets.card-${pet.name}`}
      className="min-h-24 flex-row items-center gap-4 rounded-lg border border-outline-100 bg-background-0 py-3 pl-3 pr-1 data-[active=true]:bg-background-50"
    >
      <PetPhoto uri={pet.photoUrl} species={pet.species} name={pet.name} />
      <VStack className="flex-1 gap-0.5">
        <Text className="font-heading text-[22px] font-semibold leading-7 text-typography-900">
          {pet.name}
        </Text>
        <Text className="text-sm text-typography-700">{summary}</Text>
        <HStack className="mt-1.5 flex-wrap items-center gap-2">
          <RoleBadge role={pet.role} />
          {pet.role === 'OWNER' && pet.watcherCount > 0 ? (
            <HStack className="items-center gap-1">
              <Icon as={Users} className="h-3.5 w-3.5 text-typography-700" />
              <Text className="text-[13px] font-semibold text-typography-700">
                {pet.watcherCount} {pet.watcherCount === 1 ? 'watcher' : 'watchers'}
              </Text>
            </HStack>
          ) : null}
          {pet.role === 'WATCHER' ? (
            <Text className="text-[13px] text-typography-700">by {pet.owner.email}</Text>
          ) : null}
        </HStack>
      </VStack>
      <Icon as={ChevronRight} className="h-5 w-5 text-typography-600" />
    </Pressable>
  );
}
