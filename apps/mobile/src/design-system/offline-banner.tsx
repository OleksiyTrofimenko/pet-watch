import { WifiOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useIsOnline } from '@/src/lib/use-is-online';

/** Under the status bar on every screen while offline (ScreensSchedule 05-schedule-today/offline). */
export function OfflineBanner() {
  const online = useIsOnline();
  const insets = useSafeAreaInsets();
  if (online) return null;
  return (
    <HStack
      className="items-center gap-2 bg-typography-900 px-4 pb-2"
      style={{ paddingTop: insets.top + 8 }}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID="offline.banner"
    >
      <Icon as={WifiOff} className="h-4 w-4 text-typography-0" />
      <Text className="text-sm font-semibold text-typography-0">
        You&apos;re offline. Showing saved data.
      </Text>
    </HStack>
  );
}
