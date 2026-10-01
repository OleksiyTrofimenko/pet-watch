import { PawPrint, type LucideIcon } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button } from './button';

type Tone = 'neutral' | 'primary' | 'error' | 'success' | 'info' | 'warning';

const TONE: Record<Tone, { circle: string; icon: string }> = {
  neutral: { circle: 'bg-secondary-100', icon: 'text-secondary-700' },
  primary: { circle: 'bg-primary-100', icon: 'text-primary-700' },
  error: { circle: 'bg-error-100', icon: 'text-error-700' },
  success: { circle: 'bg-success-100', icon: 'text-success-700' },
  info: { circle: 'bg-info-100', icon: 'text-info-700' },
  warning: { circle: 'bg-warning-100', icon: 'text-warning-700' },
};

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: Tone;
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
      <Box className={`h-16 w-16 items-center justify-center rounded-full ${TONE[tone].circle}`}>
        <Icon as={icon} className={`h-7 w-7 ${TONE[tone].icon}`} />
      </Box>
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
