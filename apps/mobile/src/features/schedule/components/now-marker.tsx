import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

/** "Now · 13:10" line between past and upcoming tasks today. */
export function NowMarker({ time }: { time: string }) {
  return (
    <HStack className="items-center gap-2 py-1" accessibilityLabel={`Now, ${time}`}>
      <Text className="text-[13px] font-bold text-primary-700">Now · {time}</Text>
      <Box className="h-0.5 flex-1 rounded-full bg-primary-600" />
    </HStack>
  );
}
