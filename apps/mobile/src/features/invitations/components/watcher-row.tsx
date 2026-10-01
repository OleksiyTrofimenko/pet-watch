import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type WatcherRowProps = {
  email: string;
  /** "Watching since 12 Sep" or "Expires in 5 days". */
  detail: string;
  pending: boolean;
  /** "Remove" (watcher) or "Cancel" (pending invite); both confirm first. */
  actionLabel: string;
  onAction: () => void;
};

/** A watcher or pending invite (WatcherRow.dc.html). Pending = badge + expiry, never colour alone. */
export function WatcherRow({ email, detail, pending, actionLabel, onAction }: WatcherRowProps) {
  return (
    <HStack
      className="min-h-[72px] items-center gap-3 rounded-lg border border-outline-100 bg-background-0 py-3 pl-4 pr-1"
      testID={`watcher.${email}`}
    >
      <Box className="h-10 w-10 items-center justify-center rounded-full bg-info-100">
        <Text className="font-bold text-info-700">{email[0]?.toUpperCase()}</Text>
      </Box>
      <VStack className="flex-1 gap-1">
        <Text className="text-base font-semibold text-typography-900" numberOfLines={1}>
          {email}
        </Text>
        <HStack className="flex-wrap items-center gap-2">
          {pending ? (
            <Text className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-semibold text-warning-700">
              Pending
            </Text>
          ) : null}
          <Text className="text-sm text-typography-700">{detail}</Text>
        </HStack>
      </VStack>
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${email}`}
        testID={`watcher.${email}.${actionLabel.toLowerCase()}`}
        className="min-h-11 justify-center px-3"
      >
        <Text className="text-[15px] font-semibold text-error-700 underline">{actionLabel}</Text>
      </Pressable>
    </HStack>
  );
}
