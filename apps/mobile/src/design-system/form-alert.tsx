import { CircleAlert } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

type FormAlertProps = {
  message: string;
  testID?: string;
};

/**
 * A form-level error (e.g. wrong credentials): shown above the fields, never on one field,
 * and announced to screen readers when it appears.
 */
export function FormAlert({ message, testID }: FormAlertProps) {
  return (
    <HStack
      space="sm"
      className="items-start rounded border border-error-100 bg-error-50 px-3.5 py-3"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <Icon as={CircleAlert} className="mt-0.5 h-[18px] w-[18px] text-error-700" />
      <Text className="flex-1 text-[15px] font-semibold leading-[22px] text-error-700">
        {message}
      </Text>
    </HStack>
  );
}
