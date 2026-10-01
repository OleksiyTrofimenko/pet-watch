import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Button } from './button';

type ScreenHeaderProps = {
  title?: string;
  /** "Back" (chevron) on detail screens, "Cancel" on forms. */
  leading?: { label: 'Back' | 'Cancel'; onPress: () => void; testID?: string };
  trailing?: ReactNode;
};

/** Top bar for pushed screens: leading action, centred title, optional trailing action. */
export function ScreenHeader({ title, leading, trailing }: ScreenHeaderProps) {
  return (
    <HStack className="-mx-2 min-h-[52px] items-center justify-between">
      <Box className="min-w-[88px] items-start">
        {leading ? (
          <Button
            variant="link"
            action="secondary"
            size="sm"
            label={leading.label}
            icon={leading.label === 'Back' ? ChevronLeft : undefined}
            onPress={leading.onPress}
            testID={leading.testID}
          />
        ) : null}
      </Box>
      {title ? (
        <Text
          className="flex-1 text-center text-[17px] font-bold text-typography-900"
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : null}
      <Box className="min-w-[88px] items-end">{trailing}</Box>
    </HStack>
  );
}
