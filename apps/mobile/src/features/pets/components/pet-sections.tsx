import type { PetDto } from '@petwatch/shared';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { PetCard } from './pet-card';

type PetSectionsProps = {
  pets: PetDto[];
  onOpen: (pet: PetDto) => void;
};

/** "My pets" and "Pets I'm watching": the role is per pet, so one user can see both. */
export function PetSections({ pets, onOpen }: PetSectionsProps) {
  const sections = [
    { title: 'My pets', pets: pets.filter((pet) => pet.role === 'OWNER') },
    { title: "Pets I'm watching", pets: pets.filter((pet) => pet.role === 'WATCHER') },
  ].filter((section) => section.pets.length > 0);

  return (
    <VStack className="gap-6 pb-24">
      {sections.map((section) => (
        <VStack key={section.title} className="gap-3">
          <HStack className="items-baseline gap-2">
            <Text className="text-lg font-bold text-typography-900">{section.title}</Text>
            <Text className="text-sm text-typography-600">{section.pets.length}</Text>
          </HStack>
          {section.pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} onPress={() => onOpen(pet)} />
          ))}
        </VStack>
      ))}
    </VStack>
  );
}
