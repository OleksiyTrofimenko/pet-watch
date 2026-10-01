import { ScrollView } from 'react-native';
import { HStack } from '@/components/ui/hstack';
import { Chip } from '@/src/design-system';
import type { PetFilter } from '../atoms';

type PetFilterChipsProps = {
  pets: { id: string; name: string }[];
  value: PetFilter;
  onChange: (filter: PetFilter) => void;
};

/** "All pets" + one chip per pet; one selected at a time. Scrolls horizontally. */
export function PetFilterChips({ pets, value, onChange }: PetFilterChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 flex-grow-0">
      <HStack className="gap-2 px-4">
        <Chip
          label="All pets"
          selected={value === 'all'}
          onPress={() => onChange('all')}
          testID="schedule.filter-all"
        />
        {pets.map((pet) => (
          <Chip
            key={pet.id}
            label={pet.name}
            selected={value !== 'all' && value.petId === pet.id}
            onPress={() => onChange({ petId: pet.id })}
            testID={`schedule.filter-${pet.name}`}
          />
        ))}
      </HStack>
    </ScrollView>
  );
}
