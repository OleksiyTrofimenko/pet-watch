import type { ReactNode } from 'react';
import { Check } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Leading visual (avatar, icon); the selected chip shows a check instead. */
  leading?: ReactNode;
  /** Selected colours; the default is the brand's solid primary. */
  selectedClassName?: string;
  selectedTextClassName?: string;
  testID?: string;
};

/** A pill toggle (filters, type pickers). Selection = check icon + colour, never colour alone. */
export function Chip({
  label,
  selected,
  onPress,
  leading,
  selectedClassName = 'border-primary-600 bg-primary-600',
  selectedTextClassName = 'text-typography-0',
  testID,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      testID={testID}
      className={`min-h-11 flex-row items-center gap-1.5 rounded-full border-[1.5px] px-3.5 ${
        selected ? selectedClassName : 'border-outline-200 bg-background-0'
      }`}
    >
      {selected ? (
        <Icon as={Check} className={`h-[18px] w-[18px] ${selectedTextClassName}`} />
      ) : (
        leading
      )}
      <Text
        className={`text-[15px] font-semibold ${selected ? selectedTextClassName : 'text-typography-900'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
