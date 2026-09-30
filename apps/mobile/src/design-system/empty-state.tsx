import type { LucideIcon } from 'lucide-react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <VStack space="sm" className="flex-1 items-center justify-center px-6 py-10">
      {icon ? <Icon as={icon} size="xl" className="text-typography-400" /> : null}
      <Heading size="md" className="text-center">
        {title}
      </Heading>
      {description ? <Text className="text-center text-typography-500">{description}</Text> : null}
      {action ? (
        <Button className="mt-2" onPress={action.onPress}>
          <ButtonText>{action.label}</ButtonText>
        </Button>
      ) : null}
    </VStack>
  );
}
