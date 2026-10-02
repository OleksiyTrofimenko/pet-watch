import { Info } from 'lucide-react-native';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

type AlreadyWatchingNoticeProps = {
  email: string;
  petName: string;
};

/** "Already watching" is information, not an error: the form stays so another email can be tried. */
export function AlreadyWatchingNotice({ email, petName }: AlreadyWatchingNoticeProps) {
  return (
    <HStack
      className="items-start gap-2.5 rounded bg-info-50 px-3.5 py-3"
      accessibilityRole="alert"
      testID="invite.already"
    >
      <Icon as={Info} className="mt-0.5 h-[18px] w-[18px] text-info-700" />
      <Text className="flex-1 text-[15px] font-semibold text-info-700">
        {email} is already watching {petName}.
      </Text>
    </HStack>
  );
}
