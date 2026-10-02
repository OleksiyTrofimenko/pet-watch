import { PawPrint, type LucideIcon } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button } from './button';
import { IconCircle, type IconCircleTone } from './icon-circle';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: IconCircleTone;
  action?: { label: string; onPress: () => void; icon?: LucideIcon; testID?: string };
};

/** EmptyState.dc.html: tone circle + icon, serif title, short body, optional CTA 16px below. */
export function EmptyState({
  title,
  description,
  icon = PawPrint,
  tone = 'neutral',
  action,
}: EmptyStateProps) {
  return (
    <VStack className="flex-1 items-center justify-center gap-3 px-6 py-8">
      <IconCircle icon={icon} tone={tone} />
      <Text className="text-center font-heading text-[22px] font-semibold leading-7 text-typography-900">
        {title}
      </Text>
      {description ? (
        <Text className="max-w-[300px] text-center text-[15px] leading-[22px] text-typography-700">
          {description}
        </Text>
      ) : null}
      {action ? (
        <Box className="mt-2">
          <Button
            label={action.label}
            icon={action.icon}
            onPress={action.onPress}
            testID={action.testID}
          />
        </Box>
      ) : null}
    </VStack>
  );
}
